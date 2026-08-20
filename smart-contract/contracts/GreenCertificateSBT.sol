// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title GreenCertificateSBT
/// @notice Non-transferable SAL retirement certificate with immutable IPFS metadata.
/// @dev One certificate can represent SAL retired from 1 to 5 different projects.
contract GreenCertificateSBT is ERC721, Ownable, Pausable {
    uint256 public constant MAX_RETIREMENT_PROJECTS = 5;

    address public marketplace;
    bool public marketplaceLocked;

    uint256 private _nextTokenId;

    struct CertificateInfo {
        // Backward-compatible field: equals the only project ID for a single-project
        // retirement, and 0 for a multi-project certificate. Full composition is
        // available from getCertificateComposition().
        uint256 projectId;
        // Total amount retired across every project in this certificate.
        uint256 retiredSALAmount;
        uint256 retiredCO2Kg;
        address retirer;
        uint256 retiredAt;
        string certificateURI;
        bool revoked;
        uint256 projectCount;
    }

    mapping(uint256 => CertificateInfo) public certificates;
    mapping(uint256 => bool) public revokedCertificates;

    // Composition is stored separately so certificates(tokenId) stays compact
    // and the complete project breakdown can be fetched through a dedicated getter.
    mapping(uint256 => uint256[]) private _certificateProjectIds;
    mapping(uint256 => uint256[]) private _certificateSALAmounts;

    event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace);
    event MarketplaceLocked(address indexed marketplace);

    // Kept in the same shape as the previous version for easier migration.
    // projectId is 0 when the certificate contains more than one project.
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed retirer,
        uint256 indexed projectId,
        uint256 retiredSALAmount,
        uint256 retiredCO2Kg,
        string certificateURI
    );

    event CertificateComposition(
        uint256 indexed tokenId,
        uint256[] projectIds,
        uint256[] salAmounts
    );

    event CertificateRevoked(uint256 indexed tokenId, string reason);

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "GreenCertificateSBT: caller is not marketplace");
        _;
    }

    constructor() ERC721("SALX Green Retirement Certificate", "SAL-SBT") Ownable(msg.sender) {}

    function setMarketplace(address _marketplace) external onlyOwner {
        require(!marketplaceLocked, "GreenCertificateSBT: marketplace is locked");
        require(_marketplace != address(0), "GreenCertificateSBT: marketplace is zero address");

        address oldMarketplace = marketplace;
        marketplace = _marketplace;
        emit MarketplaceUpdated(oldMarketplace, _marketplace);
    }

    /// @notice Permanently prevents marketplace replacement after deployment wiring is verified.
    function lockMarketplace() external onlyOwner {
        require(marketplace != address(0), "GreenCertificateSBT: marketplace is not set");
        require(!marketplaceLocked, "GreenCertificateSBT: marketplace is locked");
        marketplaceLocked = true;
        emit MarketplaceLocked(marketplace);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _validateURI(string memory certificateURI) internal pure {
        bytes memory uriBytes = bytes(certificateURI);
        require(uriBytes.length >= 8, "GreenCertificateSBT: empty or invalid URI");
        require(
            uriBytes[0] == 'i' &&
            uriBytes[1] == 'p' &&
            uriBytes[2] == 'f' &&
            uriBytes[3] == 's' &&
            uriBytes[4] == ':' &&
            uriBytes[5] == '/' &&
            uriBytes[6] == '/',
            "GreenCertificateSBT: must be valid IPFS URI (ipfs://...)"
        );
    }

    /// @notice Mints one immutable, non-transferable certificate for 1-5 project sources.
    function mintCertificate(
        address to,
        uint256[] calldata projectIds,
        uint256[] calldata retiredSALAmounts,
        uint256 totalRetiredSALAmount,
        uint256 retiredCO2Kg,
        string calldata certificateURI
    ) external onlyMarketplace whenNotPaused returns (uint256) {
        require(to != address(0), "GreenCertificateSBT: mint to zero address");
        require(projectIds.length > 0, "GreenCertificateSBT: no retirement project");
        require(
            projectIds.length <= MAX_RETIREMENT_PROJECTS,
            "GreenCertificateSBT: too many retirement projects"
        );
        require(
            projectIds.length == retiredSALAmounts.length,
            "GreenCertificateSBT: array length mismatch"
        );
        require(totalRetiredSALAmount > 0, "GreenCertificateSBT: SAL amount is zero");
        require(retiredCO2Kg > 0, "GreenCertificateSBT: CO2 is zero");
        _validateURI(certificateURI);

        uint256 calculatedTotalSAL;
        for (uint256 i = 0; i < projectIds.length; i++) {
            require(retiredSALAmounts[i] > 0, "GreenCertificateSBT: project SAL amount is zero");

            // Keep the certificate composition deterministic and unambiguous.
            for (uint256 j = 0; j < i; j++) {
                require(projectIds[j] != projectIds[i], "GreenCertificateSBT: duplicate project");
            }

            calculatedTotalSAL += retiredSALAmounts[i];
        }

        require(
            calculatedTotalSAL == totalRetiredSALAmount,
            "GreenCertificateSBT: total SAL mismatch"
        );

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        uint256 legacyProjectId = projectIds.length == 1 ? projectIds[0] : 0;

        certificates[tokenId] = CertificateInfo({
            projectId: legacyProjectId,
            retiredSALAmount: totalRetiredSALAmount,
            retiredCO2Kg: retiredCO2Kg,
            retirer: to,
            retiredAt: block.timestamp,
            certificateURI: certificateURI,
            revoked: false,
            projectCount: projectIds.length
        });

        for (uint256 i = 0; i < projectIds.length; i++) {
            _certificateProjectIds[tokenId].push(projectIds[i]);
            _certificateSALAmounts[tokenId].push(retiredSALAmounts[i]);
        }

        _safeMint(to, tokenId);

        emit CertificateMinted(
            tokenId,
            to,
            legacyProjectId,
            totalRetiredSALAmount,
            retiredCO2Kg,
            certificateURI
        );
        emit CertificateComposition(tokenId, projectIds, retiredSALAmounts);

        return tokenId;
    }

    /// @notice Returns the exact per-project source composition of a certificate.
    function getCertificateComposition(
        uint256 tokenId
    ) external view returns (uint256[] memory projectIds, uint256[] memory salAmounts) {
        require(
            certificates[tokenId].retirer != address(0),
            "GreenCertificateSBT: certificate does not exist"
        );
        return (_certificateProjectIds[tokenId], _certificateSALAmounts[tokenId]);
    }

    /// @notice Convenience getter for frontend/backend audit views.
    function getCertificateDetails(
        uint256 tokenId
    ) external view returns (
        CertificateInfo memory info,
        uint256[] memory projectIds,
        uint256[] memory salAmounts
    ) {
        require(
            certificates[tokenId].retirer != address(0),
            "GreenCertificateSBT: certificate does not exist"
        );
        return (
            certificates[tokenId],
            _certificateProjectIds[tokenId],
            _certificateSALAmounts[tokenId]
        );
    }

    function revokeCertificate(uint256 tokenId, string memory reason) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "GreenCertificateSBT: token does not exist");
        require(!revokedCertificates[tokenId], "GreenCertificateSBT: already revoked");
        require(bytes(reason).length > 0, "GreenCertificateSBT: empty reason");

        revokedCertificates[tokenId] = true;
        certificates[tokenId].revoked = true;
        _burn(tokenId);

        emit CertificateRevoked(tokenId, reason);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "GreenCertificateSBT: token does not exist");
        require(!revokedCertificates[tokenId], "GreenCertificateSBT: token is revoked");
        return certificates[tokenId].certificateURI;
    }

    function isRevoked(uint256 tokenId) external view returns (bool) {
        return revokedCertificates[tokenId];
    }

    function approve(address, uint256) public pure override {
        revert("GreenCertificateSBT: approvals are disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("GreenCertificateSBT: approvals are disabled");
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override whenNotPaused returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("GreenCertificateSBT: certificate is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
