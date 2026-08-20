// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./SAL1155.sol";
import "./GreenCertificateSBT.sol";

/// @title SALMarketplace
/// @notice Project validation, SAL primary-market trading, and verified SAL retirement.
contract SALMarketplace is Ownable, ReentrancyGuard, ERC1155Holder, Pausable, EIP712 {
    uint256 public constant KG_CO2_PER_SAL = 10;
    uint256 public constant MAX_RETIREMENT_PROJECTS = 5;

    bytes32 public constant CERTIFICATE_METADATA_TYPEHASH = keccak256(
        "CertificateMetadata(address retirer,uint256[] projectIds,uint256[] salAmounts,bytes32 uriHash,uint256 nonce,uint256 deadline)"
    );

    uint256 public minPrice = 0.001 ether;
    uint256 public maxPrice = 1000 ether;

    uint256 public platformFeeBps = 200;
    uint256 public salTokenizationFeePerSAL = 0.00000667 ether;
    uint256 public certificateMintFee = 0.00067 ether;
    uint256 public treasuryBalance;

    SAL1155 public immutable salToken;
    GreenCertificateSBT public immutable certificateSBT;
    address public metadataSigner;

    uint256 public nextProjectId;
    uint256 public nextListingId;

    struct Project {
        uint256 projectId;
        address owner;
        string projectURI;
        uint256 proposedCO2Kg;
        uint256 approvedCO2Kg;
        bool approved;
        bool blacklisted;
        uint256 createdAt;
        bool exists;
        bool cancelled;
    }

    struct ProjectTokenizationFee {
        uint256 lockedFeePerSAL;
        uint256 depositReceived;
        bool settled;
        uint256 actualFeeCharged;
        uint256 refundCredited;
    }

    struct Listing {
        uint256 listingId;
        uint256 projectId;
        address seller;
        uint256 amount;
        uint256 pricePerUnit;
        bool active;
        uint256 createdAt;
    }

    address[] public validators;
    mapping(address => bool) public isValidator;
    mapping(address => bool) public blacklistedOwners;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => ProjectTokenizationFee) public projectTokenizationFees;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public sellerBalances;
    mapping(address => uint256) public tokenizationFeeRefundBalances;

    mapping(uint256 => uint256) public listingApprovalVotes;
    mapping(uint256 => mapping(address => bool)) public hasVotedOnProject;

    // Validator eligibility and quorum are frozen when each project is submitted.
    mapping(uint256 => mapping(address => bool)) public projectValidatorEligible;
    mapping(uint256 => uint256) public projectEligibleValidatorCount;
    mapping(uint256 => uint256) public projectApprovalQuorum;

    // Each retirement authorization is one-time-use per wallet.
    mapping(address => uint256) public certificateNonces;

    event ProjectSubmitted(
        uint256 indexed projectId,
        address indexed owner,
        string projectURI,
        uint256 proposedCO2Kg
    );
    event ProjectValidatorSnapshot(
        uint256 indexed projectId,
        uint256 eligibleValidatorCount,
        uint256 approvalQuorum
    );
    event ProjectApprovalVoted(uint256 indexed projectId, address indexed validator, bool approved);
    event ProjectApproved(
        uint256 indexed projectId,
        address indexed approvedBy,
        uint256 approvedCO2Kg,
        uint256 salAmount
    );
    event PendingProjectCancelled(
        uint256 indexed projectId,
        address indexed owner,
        uint256 refundAmount
    );

    event OwnerBlacklisted(address indexed account, string reason);
    event OwnerUnblacklisted(address indexed account);
    event ProjectBlacklisted(uint256 indexed projectId, string reason);
    event ProjectUnblacklisted(uint256 indexed projectId);

    event SALTokenizationFeeUpdated(uint256 oldFee, uint256 newFee);
    event CertificateMintFeeUpdated(uint256 oldFee, uint256 newFee);
    event MetadataSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event TokenizationDepositReceived(
        uint256 indexed projectId,
        address indexed owner,
        uint256 maximumSALAmount,
        uint256 lockedFeePerSAL,
        uint256 depositAmount
    );
    event TokenizationFeeCollected(
        uint256 indexed projectId,
        address indexed owner,
        uint256 salAmount,
        uint256 feeAmount
    );
    event TokenizationFeeRefundCredited(
        uint256 indexed projectId,
        address indexed owner,
        uint256 amount
    );
    event TokenizationFeeRefundWithdrawn(address indexed owner, uint256 amount);
    // Kept in the same shape as the previous version for easier migration.
    // projectId is 0 when one certificate retires SAL from multiple projects.
    event CertificateMintFeeCollected(
        address indexed retirer,
        uint256 indexed projectId,
        uint256 indexed certificateTokenId,
        uint256 feeAmount
    );

    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed projectId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerUnit
    );
    event ListingCancelled(uint256 indexed listingId);
    event SALPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 salAmount,
        uint256 totalPrice,
        uint256 feePaid
    );
    event SALRetired(
        address indexed retirer,
        uint256 indexed projectId,
        uint256 salAmount,
        uint256 co2Kg,
        uint256 certificateTokenId
    );
    event MultiProjectSALRetired(
        address indexed retirer,
        uint256 indexed certificateTokenId,
        uint256[] projectIds,
        uint256[] salAmounts,
        uint256 totalSALAmount,
        uint256 totalCO2Kg
    );

    event TreasuryClaimed(address indexed to, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    modifier whenCallerNotBlacklisted() {
        require(!blacklistedOwners[msg.sender], "SALMarketplace: address is blacklisted");
        _;
    }

    constructor(
        address salTokenAddress,
        address certificateSBTAddress,
        address metadataSignerAddress
    ) Ownable(msg.sender) EIP712("SALMarketplace", "1") {
        require(salTokenAddress != address(0), "SALMarketplace: SAL token is zero address");
        require(certificateSBTAddress != address(0), "SALMarketplace: certificate is zero address");
        require(metadataSignerAddress != address(0), "SALMarketplace: metadata signer is zero address");

        salToken = SAL1155(salTokenAddress);
        certificateSBT = GreenCertificateSBT(certificateSBTAddress);
        metadataSigner = metadataSignerAddress;

        validators.push(msg.sender);
        isValidator[msg.sender] = true;
        emit ValidatorAdded(msg.sender);
    }

    receive() external payable {
        treasuryBalance += msg.value;
    }

    // ----------------------------- Emergency controls -----------------------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ----------------------------- Admin configuration -----------------------------

    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "SALMarketplace: fee exceeds 10%");
        platformFeeBps = newFeeBps;
    }

    function updateSALTokenizationFeePerSAL(uint256 newFee) external onlyOwner {
        require(newFee > 0, "SALMarketplace: tokenization fee is zero");
        uint256 oldFee = salTokenizationFeePerSAL;
        salTokenizationFeePerSAL = newFee;
        emit SALTokenizationFeeUpdated(oldFee, newFee);
    }

    function updateCertificateMintFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "SALMarketplace: certificate fee is zero");
        uint256 oldFee = certificateMintFee;
        certificateMintFee = newFee;
        emit CertificateMintFeeUpdated(oldFee, newFee);
    }

    function updateMetadataSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "SALMarketplace: metadata signer is zero address");
        address oldSigner = metadataSigner;
        metadataSigner = newSigner;
        emit MetadataSignerUpdated(oldSigner, newSigner);
    }

    function updatePriceRange(uint256 minValue, uint256 maxValue) external onlyOwner {
        require(minValue < maxValue, "SALMarketplace: min must be less than max");
        minPrice = minValue;
        maxPrice = maxValue;
    }

    function claimTreasury(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "SALMarketplace: recipient is zero address");
        require(amount <= treasuryBalance, "SALMarketplace: insufficient treasury balance");
        treasuryBalance -= amount;
        (bool success, ) = to.call{value: amount}("");
        require(success, "SALMarketplace: transfer failed");
        emit TreasuryClaimed(to, amount);
    }

    // ----------------------------- Validators -----------------------------

    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "SALMarketplace: invalid address");
        require(!isValidator[validator], "SALMarketplace: already validator");
        validators.push(validator);
        isValidator[validator] = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(isValidator[validator], "SALMarketplace: not validator");
        require(validators.length > 1, "SALMarketplace: at least one validator required");
        isValidator[validator] = false;

        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) {
                validators[i] = validators[validators.length - 1];
                validators.pop();
                break;
            }
        }
        emit ValidatorRemoved(validator);
    }

    function getValidatorsCount() external view returns (uint256) {
        return validators.length;
    }

    function getProjectValidationSnapshot(
        uint256 projectId
    ) external view returns (uint256 eligibleValidatorCount, uint256 approvalQuorum) {
        return (projectEligibleValidatorCount[projectId], projectApprovalQuorum[projectId]);
    }

    // ----------------------------- Blacklist controls -----------------------------

    function blacklistOwner(address account, string calldata reason) external onlyOwner {
        require(account != address(0), "SALMarketplace: invalid address");
        require(!blacklistedOwners[account], "SALMarketplace: owner already blacklisted");
        require(bytes(reason).length > 0, "SALMarketplace: empty blacklist reason");
        blacklistedOwners[account] = true;
        emit OwnerBlacklisted(account, reason);
    }

    function unblacklistOwner(address account) external onlyOwner {
        require(blacklistedOwners[account], "SALMarketplace: owner is not blacklisted");
        blacklistedOwners[account] = false;
        emit OwnerUnblacklisted(account);
    }

    function blacklistProject(uint256 projectId, string calldata reason) external onlyOwner {
        Project storage project = projects[projectId];
        require(project.exists, "SALMarketplace: project does not exist");
        require(!project.blacklisted, "SALMarketplace: project already blacklisted");
        require(bytes(reason).length > 0, "SALMarketplace: empty blacklist reason");

        project.blacklisted = true;
        if (!salToken.projectBlacklist(projectId)) {
            salToken.blacklistProject(projectId, reason);
        }
        emit ProjectBlacklisted(projectId, reason);
    }

    function unblacklistProject(uint256 projectId) external onlyOwner {
        Project storage project = projects[projectId];
        require(project.exists, "SALMarketplace: project does not exist");
        require(project.blacklisted, "SALMarketplace: project is not blacklisted");

        project.blacklisted = false;
        if (salToken.projectBlacklist(projectId)) {
            salToken.unblacklistProject(projectId);
        }
        emit ProjectUnblacklisted(projectId);
    }

    // ----------------------------- Projects and tokenization -----------------------------

    function submitProject(
        string calldata projectURI,
        uint256 proposedCO2Kg
    ) external payable whenNotPaused whenCallerNotBlacklisted {
        require(bytes(projectURI).length > 0, "SALMarketplace: empty URI");
        require(proposedCO2Kg >= KG_CO2_PER_SAL, "SALMarketplace: CO2 must be at least 10 kg");

        uint256 maximumSALAmount = proposedCO2Kg / KG_CO2_PER_SAL;
        uint256 lockedFeePerSAL = salTokenizationFeePerSAL;
        uint256 requiredDeposit = maximumSALAmount * lockedFeePerSAL;
        require(msg.value == requiredDeposit, "SALMarketplace: incorrect tokenization deposit");

        nextProjectId++;
        uint256 projectId = nextProjectId;

        uint256 eligibleValidatorCount;
        for (uint256 i = 0; i < validators.length; i++) {
            address validator = validators[i];
            if (validator != msg.sender) {
                projectValidatorEligible[projectId][validator] = true;
                eligibleValidatorCount++;
            }
        }
        require(eligibleValidatorCount > 0, "SALMarketplace: no independent validator available");
        uint256 approvalQuorum = (eligibleValidatorCount / 2) + 1;
        projectEligibleValidatorCount[projectId] = eligibleValidatorCount;
        projectApprovalQuorum[projectId] = approvalQuorum;

        projects[projectId] = Project({
            projectId: projectId,
            owner: msg.sender,
            projectURI: projectURI,
            proposedCO2Kg: proposedCO2Kg,
            approvedCO2Kg: 0,
            approved: false,
            blacklisted: false,
            createdAt: block.timestamp,
            exists: true,
            cancelled: false
        });
        projectTokenizationFees[projectId] = ProjectTokenizationFee({
            lockedFeePerSAL: lockedFeePerSAL,
            depositReceived: requiredDeposit,
            settled: false,
            actualFeeCharged: 0,
            refundCredited: 0
        });

        emit ProjectSubmitted(projectId, msg.sender, projectURI, proposedCO2Kg);
        emit ProjectValidatorSnapshot(projectId, eligibleValidatorCount, approvalQuorum);
        emit TokenizationDepositReceived(
            projectId,
            msg.sender,
            maximumSALAmount,
            lockedFeePerSAL,
            requiredDeposit
        );
    }

    function voteOnProject(uint256 projectId, bool approve) external whenNotPaused {
        Project storage project = projects[projectId];
        require(project.exists, "SALMarketplace: project does not exist");
        require(!project.approved, "SALMarketplace: project already approved");
        require(!project.cancelled, "SALMarketplace: project cancelled");
        require(!project.blacklisted, "SALMarketplace: project blacklisted");
        require(projectValidatorEligible[projectId][msg.sender], "SALMarketplace: validator not eligible for project");
        require(!blacklistedOwners[msg.sender], "SALMarketplace: validator is blacklisted");
        require(!hasVotedOnProject[projectId][msg.sender], "SALMarketplace: already voted");

        hasVotedOnProject[projectId][msg.sender] = true;
        if (approve) listingApprovalVotes[projectId]++;
        emit ProjectApprovalVoted(projectId, msg.sender, approve);
    }

    function approveAndMintSAL(
        uint256 projectId,
        uint256 approvedCO2Kg,
        string calldata tokenURI
    ) external onlyOwner nonReentrant whenNotPaused {
        Project storage project = projects[projectId];
        require(
            project.exists && !project.approved && !project.blacklisted && !project.cancelled,
            "SALMarketplace: invalid project status"
        );
        require(!blacklistedOwners[project.owner], "SALMarketplace: project owner is blacklisted");
        require(
            approvedCO2Kg > 0 && approvedCO2Kg <= project.proposedCO2Kg,
            "SALMarketplace: invalid approved CO2"
        );
        require(
            listingApprovalVotes[projectId] >= projectApprovalQuorum[projectId],
            "SALMarketplace: insufficient approval votes"
        );
        require(
            approvedCO2Kg % KG_CO2_PER_SAL == 0,
            "SALMarketplace: approved CO2 must be divisible by 10 kg"
        );

        uint256 salAmount = approvedCO2Kg / KG_CO2_PER_SAL;
        ProjectTokenizationFee storage feeInfo = projectTokenizationFees[projectId];
        require(!feeInfo.settled, "SALMarketplace: tokenization fee already settled");

        uint256 actualTokenizationFee = salAmount * feeInfo.lockedFeePerSAL;
        require(
            actualTokenizationFee <= feeInfo.depositReceived,
            "SALMarketplace: tokenization fee exceeds deposit"
        );
        uint256 refundAmount = feeInfo.depositReceived - actualTokenizationFee;

        project.approved = true;
        project.approvedCO2Kg = approvedCO2Kg;
        feeInfo.settled = true;
        feeInfo.actualFeeCharged = actualTokenizationFee;
        feeInfo.refundCredited = refundAmount;
        treasuryBalance += actualTokenizationFee;

        if (refundAmount > 0) {
            tokenizationFeeRefundBalances[project.owner] += refundAmount;
        }

        salToken.mintSAL(project.owner, projectId, salAmount, tokenURI);

        emit TokenizationFeeCollected(projectId, project.owner, salAmount, actualTokenizationFee);
        if (refundAmount > 0) {
            emit TokenizationFeeRefundCredited(projectId, project.owner, refundAmount);
        }
        emit ProjectApproved(projectId, msg.sender, approvedCO2Kg, salAmount);
    }

    function cancelPendingProject(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        require(project.exists, "SALMarketplace: project does not exist");
        require(msg.sender == project.owner, "SALMarketplace: caller is not project owner");
        require(!project.approved && !project.cancelled, "SALMarketplace: invalid project status");

        ProjectTokenizationFee storage feeInfo = projectTokenizationFees[projectId];
        require(!feeInfo.settled, "SALMarketplace: tokenization fee already settled");

        uint256 refundAmount = feeInfo.depositReceived;
        project.cancelled = true;
        feeInfo.settled = true;
        feeInfo.refundCredited = refundAmount;
        tokenizationFeeRefundBalances[project.owner] += refundAmount;

        emit PendingProjectCancelled(projectId, project.owner, refundAmount);
        emit TokenizationFeeRefundCredited(projectId, project.owner, refundAmount);
    }

    function withdrawTokenizationFeeRefund() external nonReentrant {
        uint256 refundAmount = tokenizationFeeRefundBalances[msg.sender];
        require(refundAmount > 0, "SALMarketplace: no tokenization fee refund");

        tokenizationFeeRefundBalances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "SALMarketplace: transfer failed");
        emit TokenizationFeeRefundWithdrawn(msg.sender, refundAmount);
    }

    // ----------------------------- Marketplace -----------------------------

    function createListing(
        uint256 projectId,
        uint256 amount,
        uint256 pricePerUnit
    ) external whenNotPaused whenCallerNotBlacklisted {
        Project storage project = projects[projectId];
        require(project.approved && !project.blacklisted, "SALMarketplace: invalid project");
        require(!salToken.projectBlacklist(projectId), "SALMarketplace: project token blacklisted");
        require(msg.sender == project.owner, "SALMarketplace: caller is not project owner");
        require(amount > 0, "SALMarketplace: amount is zero");
        require(
            pricePerUnit >= minPrice && pricePerUnit <= maxPrice,
            "SALMarketplace: invalid price"
        );

        salToken.safeTransferFrom(msg.sender, address(this), projectId, amount, "");

        nextListingId++;
        listings[nextListingId] = Listing({
            listingId: nextListingId,
            projectId: projectId,
            seller: msg.sender,
            amount: amount,
            pricePerUnit: pricePerUnit,
            active: true,
            createdAt: block.timestamp
        });
        emit ListingCreated(nextListingId, projectId, msg.sender, amount, pricePerUnit);
    }

    function buySAL(
        uint256 listingId,
        uint256 salAmount
    ) external payable nonReentrant whenNotPaused whenCallerNotBlacklisted {
        Listing storage listing = listings[listingId];
        Project storage project = projects[listing.projectId];
        require(listing.active, "SALMarketplace: listing inactive");
        require(!project.blacklisted, "SALMarketplace: project blacklisted");
        require(!salToken.projectBlacklist(listing.projectId), "SALMarketplace: project token blacklisted");
        require(!blacklistedOwners[listing.seller], "SALMarketplace: seller blacklisted");
        require(salAmount > 0, "SALMarketplace: amount is zero");
        require(salAmount <= listing.amount, "SALMarketplace: insufficient listing amount");

        uint256 totalPrice = salAmount * listing.pricePerUnit;
        require(msg.value == totalPrice, "SALMarketplace: incorrect ETH amount");

        listing.amount -= salAmount;
        if (listing.amount == 0) listing.active = false;

        uint256 fee = (totalPrice * platformFeeBps) / 10000;
        sellerBalances[listing.seller] += totalPrice - fee;
        treasuryBalance += fee;

        salToken.safeTransferFrom(address(this), msg.sender, listing.projectId, salAmount, "");
        emit SALPurchased(listingId, msg.sender, salAmount, totalPrice, fee);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "SALMarketplace: caller is not seller");
        _cancelListingAndReturnSAL(listingId, listing);
    }

    function forceCancelListing(uint256 listingId) external onlyOwner nonReentrant {
        Listing storage listing = listings[listingId];
        _cancelListingAndReturnSAL(listingId, listing);
    }

    function _cancelListingAndReturnSAL(uint256 listingId, Listing storage listing) internal {
        require(listing.active, "SALMarketplace: listing inactive");
        uint256 remainingAmount = listing.amount;
        listing.active = false;
        listing.amount = 0;

        if (salToken.projectBlacklist(listing.projectId)) {
            salToken.releaseBlacklistedSAL(listing.seller, listing.projectId, remainingAmount);
        } else {
            salToken.safeTransferFrom(
                address(this),
                listing.seller,
                listing.projectId,
                remainingAmount,
                ""
            );
        }
        emit ListingCancelled(listingId);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "SALMarketplace: no proceeds");
        sellerBalances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "SALMarketplace: transfer failed");
    }

    // ----------------------------- Verified retirement -----------------------------

    /// @notice Returns the EIP-712 digest used by the backend metadata signer.
    /// @dev The authorization covers the exact ordered projectIds + salAmounts arrays,
    ///      certificate URI, user nonce and deadline.
    function certificateAuthorizationDigest(
        address retirer,
        uint256[] calldata projectIds,
        uint256[] calldata salAmounts,
        string calldata certificateURI,
        uint256 nonce,
        uint256 deadline
    ) external view returns (bytes32) {
        return _certificateAuthorizationDigest(
            retirer,
            projectIds,
            salAmounts,
            certificateURI,
            nonce,
            deadline
        );
    }

    /// @notice Retires SAL from 1 to 5 approved projects and mints ONE SBT certificate.
    /// @dev One certificateMintFee is charged per certificate, not per project.
    function retireSAL(
        uint256[] calldata projectIds,
        uint256[] calldata salAmounts,
        string calldata certificateURI,
        uint256 deadline,
        bytes calldata metadataSignature
    ) external payable nonReentrant whenNotPaused whenCallerNotBlacklisted {
        uint256 totalSALAmount = _validateRetirementInputs(projectIds, salAmounts);

        require(bytes(certificateURI).length > 0, "SALMarketplace: empty certificate URI");
        require(block.timestamp <= deadline, "SALMarketplace: metadata authorization expired");

        uint256 nonce = certificateNonces[msg.sender];
        bytes32 digest = _certificateAuthorizationDigest(
            msg.sender,
            projectIds,
            salAmounts,
            certificateURI,
            nonce,
            deadline
        );
        address recoveredSigner = ECDSA.recover(digest, metadataSignature);
        require(recoveredSigner == metadataSigner, "SALMarketplace: invalid metadata signature");

        // Consume the one-time authorization before any external token/SBT calls.
        // If the transaction reverts later, this increment is reverted atomically as well.
        certificateNonces[msg.sender] = nonce + 1;

        uint256 feeAmount = certificateMintFee;
        require(msg.value == feeAmount, "SALMarketplace: incorrect certificate fee");
        treasuryBalance += feeAmount;

        // ERC-1155 setApprovalForAll() once is enough for every project token ID.
        // Max 5 projects keeps this loop bounded and predictable.
        for (uint256 i = 0; i < projectIds.length; i++) {
            salToken.safeTransferFrom(
                msg.sender,
                address(this),
                projectIds[i],
                salAmounts[i],
                ""
            );
            salToken.burnSAL(address(this), projectIds[i], salAmounts[i]);
        }

        uint256 totalCO2Kg = totalSALAmount * KG_CO2_PER_SAL;

        uint256 certificateTokenId = certificateSBT.mintCertificate(
            msg.sender,
            projectIds,
            salAmounts,
            totalSALAmount,
            totalCO2Kg,
            certificateURI
        );

        uint256 legacyProjectId = projectIds.length == 1 ? projectIds[0] : 0;
        emit CertificateMintFeeCollected(
            msg.sender,
            legacyProjectId,
            certificateTokenId,
            feeAmount
        );

        // Keep the existing per-project retirement event for transparent audit trails.
        // A backend upgraded for multi-project retirement should group these events by
        // certificateTokenId or use MultiProjectSALRetired as the canonical batch event.
        for (uint256 i = 0; i < projectIds.length; i++) {
            emit SALRetired(
                msg.sender,
                projectIds[i],
                salAmounts[i],
                salAmounts[i] * KG_CO2_PER_SAL,
                certificateTokenId
            );
        }

        emit MultiProjectSALRetired(
            msg.sender,
            certificateTokenId,
            projectIds,
            salAmounts,
            totalSALAmount,
            totalCO2Kg
        );
    }

    /// @dev Validates the entire retirement basket before any token is transferred/burned.
    function _validateRetirementInputs(
        uint256[] calldata projectIds,
        uint256[] calldata salAmounts
    ) internal view returns (uint256 totalSALAmount) {
        uint256 projectCount = projectIds.length;

        require(projectCount > 0, "SALMarketplace: no retirement project");
        require(
            projectCount <= MAX_RETIREMENT_PROJECTS,
            "SALMarketplace: maximum 5 retirement projects"
        );
        require(
            projectCount == salAmounts.length,
            "SALMarketplace: array length mismatch"
        );

        for (uint256 i = 0; i < projectCount; i++) {
            uint256 projectId = projectIds[i];
            uint256 salAmount = salAmounts[i];
            Project storage project = projects[projectId];

            require(salAmount > 0, "SALMarketplace: amount is zero");
            require(
                project.exists && project.approved,
                "SALMarketplace: project is not approved"
            );
            require(!project.blacklisted, "SALMarketplace: project blacklisted");
            require(
                !salToken.projectBlacklist(projectId),
                "SALMarketplace: project token blacklisted"
            );

            // A project may only appear once in one retirement certificate.
            for (uint256 j = 0; j < i; j++) {
                require(
                    projectIds[j] != projectId,
                    "SALMarketplace: duplicate retirement project"
                );
            }

            // Fail early with a clear message instead of waiting for ERC-1155 transfer to revert.
            require(
                salToken.balanceOf(msg.sender, projectId) >= salAmount,
                "SALMarketplace: insufficient SAL balance"
            );

            totalSALAmount += salAmount;
        }
    }

    function _certificateAuthorizationDigest(
        address retirer,
        uint256[] calldata projectIds,
        uint256[] calldata salAmounts,
        string calldata certificateURI,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes32) {
        // EIP-712 dynamic arrays are represented in the struct hash by hashing the
        // concatenated 32-byte encodings of their elements. For uint256[] this is
        // exactly keccak256(abi.encodePacked(array)).
        bytes32 projectIdsHash = keccak256(abi.encodePacked(projectIds));
        bytes32 salAmountsHash = keccak256(abi.encodePacked(salAmounts));

        bytes32 structHash = keccak256(
            abi.encode(
                CERTIFICATE_METADATA_TYPEHASH,
                retirer,
                projectIdsHash,
                salAmountsHash,
                keccak256(bytes(certificateURI)),
                nonce,
                deadline
            )
        );

        return _hashTypedDataV4(structHash);
    }

}
