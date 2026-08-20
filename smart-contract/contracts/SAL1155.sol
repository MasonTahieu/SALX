// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title SAL1155
/// @notice ERC-1155 SAL tokens. One SAL represents 10 kg CO2e in SALMarketplace.
contract SAL1155 is ERC1155, Ownable, Pausable {
    address public marketplace;
    bool public marketplaceLocked;

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => bool) public projectBlacklist;

    bool private _blacklistTransferBypass;

    event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace);
    event MarketplaceLocked(address indexed marketplace);
    event SALMinted(address indexed to, uint256 indexed projectId, uint256 amount, string tokenURI);
    event SALBurned(address indexed from, uint256 indexed projectId, uint256 amount);
    event TokenURIUpdated(uint256 indexed projectId, string tokenURI);
    event ProjectBlacklisted(uint256 indexed projectId, string reason);
    event ProjectUnblacklisted(uint256 indexed projectId);

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "SAL1155: caller is not marketplace");
        _;
    }

    modifier onlyOwnerOrMarketplace() {
        require(
            msg.sender == owner() || msg.sender == marketplace,
            "SAL1155: caller is not owner or marketplace"
        );
        _;
    }

    constructor() ERC1155("") Ownable(msg.sender) {}

    /// @notice Connects the marketplace. Call lockMarketplace after deployment wiring is verified.
    function setMarketplace(address _marketplace) external onlyOwner {
        require(!marketplaceLocked, "SAL1155: marketplace is locked");
        require(_marketplace != address(0), "SAL1155: marketplace is zero address");
        address oldMarketplace = marketplace;
        marketplace = _marketplace;
        emit MarketplaceUpdated(oldMarketplace, _marketplace);
    }

    /// @notice Permanently prevents marketplace replacement.
    function lockMarketplace() external onlyOwner {
        require(marketplace != address(0), "SAL1155: marketplace is not set");
        require(!marketplaceLocked, "SAL1155: marketplace is locked");
        marketplaceLocked = true;
        emit MarketplaceLocked(marketplace);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Can be called by the owner directly or by the authorized marketplace.
    function blacklistProject(uint256 projectId, string memory reason) external onlyOwnerOrMarketplace {
        require(!projectBlacklist[projectId], "SAL1155: project already blacklisted");
        projectBlacklist[projectId] = true;
        emit ProjectBlacklisted(projectId, reason);
    }

    function unblacklistProject(uint256 projectId) external onlyOwnerOrMarketplace {
        require(projectBlacklist[projectId], "SAL1155: project is not blacklisted");
        projectBlacklist[projectId] = false;
        emit ProjectUnblacklisted(projectId);
    }

    function _validateURI(string memory tokenURI) internal pure {
        bytes memory uriBytes = bytes(tokenURI);
        require(uriBytes.length >= 8, "SAL1155: empty or invalid URI");
        require(
            uriBytes[0] == 'i' &&
            uriBytes[1] == 'p' &&
            uriBytes[2] == 'f' &&
            uriBytes[3] == 's' &&
            uriBytes[4] == ':' &&
            uriBytes[5] == '/' &&
            uriBytes[6] == '/',
            "SAL1155: must be valid IPFS URI (ipfs://...)"
        );
    }

    function mintSAL(
        address to,
        uint256 projectId,
        uint256 amount,
        string memory tokenURI
    ) external onlyMarketplace whenNotPaused {
        require(to != address(0), "SAL1155: mint to zero address");
        require(amount > 0, "SAL1155: amount is zero");
        require(!projectBlacklist[projectId], "SAL1155: project is blacklisted");

        _validateURI(tokenURI);
        _setTokenURI(projectId, tokenURI);
        _mint(to, projectId, amount, "");

        emit SALMinted(to, projectId, amount, tokenURI);
    }

    function burnSAL(
        address from,
        uint256 projectId,
        uint256 amount
    ) external onlyMarketplace whenNotPaused {
        require(from != address(0), "SAL1155: burn from zero address");
        require(amount > 0, "SAL1155: amount is zero");

        _burn(from, projectId, amount);
        emit SALBurned(from, projectId, amount);
    }

    /// @notice Returns blacklisted SAL held in marketplace escrow to the seller.
    /// @dev This is the only transfer bypass. It cannot be used to sell or retire blacklisted SAL.
    function releaseBlacklistedSAL(
        address to,
        uint256 projectId,
        uint256 amount
    ) external onlyMarketplace whenNotPaused {
        require(projectBlacklist[projectId], "SAL1155: project is not blacklisted");
        require(to != address(0), "SAL1155: transfer to zero address");
        require(amount > 0, "SAL1155: amount is zero");

        _blacklistTransferBypass = true;
        _safeTransferFrom(marketplace, to, projectId, amount, "");
        _blacklistTransferBypass = false;
    }

    function setTokenURI(uint256 projectId, string memory tokenURI) external onlyOwner {
        _validateURI(tokenURI);
        _setTokenURI(projectId, tokenURI);
    }

    function uri(uint256 projectId) public view override returns (string memory) {
        return _tokenURIs[projectId];
    }

    function _setTokenURI(uint256 projectId, string memory tokenURI) internal {
        _tokenURIs[projectId] = tokenURI;
        emit TokenURIUpdated(projectId, tokenURI);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override whenNotPaused {
        if (from != address(0) && to != address(0) && !_blacklistTransferBypass) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(!projectBlacklist[ids[i]], "SAL1155: project is blacklisted");
            }
        }
        super._update(from, to, ids, values);
    }
}
