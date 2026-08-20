import { expect } from "chai";
import { network } from "hardhat";

const hre = await network.create();
const { ethers } = hre;

const PROJECT_URI = "ipfs://QmProjectMetadata123";
const CERT_URI = "ipfs://QmCertificateMetadata456";
const PROPOSED_CO2_KG = 1000n;
const APPROVED_CO2_KG = 1000n;
const TOKENIZATION_FEE_PER_SAL = ethers.parseEther("0.00000667");
const CERTIFICATE_MINT_FEE = ethers.parseEther("0.00067");
const SAL_AMOUNT = APPROVED_CO2_KG / 10n;
const TOKENIZATION_DEPOSIT = SAL_AMOUNT * TOKENIZATION_FEE_PER_SAL;

async function deployAll() {
  const [owner, projectOwner, buyer, validator2, outsider, metadataSigner] =
    await ethers.getSigners();

  const salToken = await ethers.deployContract("SAL1155");
  await salToken.waitForDeployment();

  const certificateSBT = await ethers.deployContract("GreenCertificateSBT");
  await certificateSBT.waitForDeployment();

  const marketplace = await ethers.deployContract("SALMarketplace", [
    await salToken.getAddress(),
    await certificateSBT.getAddress(),
    metadataSigner.address,
  ]);
  await marketplace.waitForDeployment();

  await salToken.setMarketplace(await marketplace.getAddress());
  await certificateSBT.setMarketplace(await marketplace.getAddress());
  await salToken.lockMarketplace();
  await certificateSBT.lockMarketplace();

  return {
    owner,
    projectOwner,
    buyer,
    validator2,
    outsider,
    metadataSigner,
    salToken,
    certificateSBT,
    marketplace,
  };
}

async function submitAndApprove(
  ctx,
  {
    projectURI = PROJECT_URI,
    proposedCO2Kg = PROPOSED_CO2_KG,
    approvedCO2Kg = APPROVED_CO2_KG,
  } = {}
) {
  const maximumSALAmount = proposedCO2Kg / 10n;
  const deposit = maximumSALAmount * TOKENIZATION_FEE_PER_SAL;

  await ctx.marketplace
    .connect(ctx.projectOwner)
    .submitProject(projectURI, proposedCO2Kg, { value: deposit });

  const projectId = await ctx.marketplace.nextProjectId();

  await ctx.marketplace.connect(ctx.owner).voteOnProject(projectId, true);
  await ctx.marketplace
    .connect(ctx.owner)
    .approveAndMintSAL(projectId, approvedCO2Kg, projectURI);

  return projectId;
}

async function createListingAndBuy(ctx, projectId, amount, price = ethers.parseEther("0.01")) {
  await ctx.salToken
    .connect(ctx.projectOwner)
    .setApprovalForAll(await ctx.marketplace.getAddress(), true);

  await ctx.marketplace
    .connect(ctx.projectOwner)
    .createListing(projectId, amount, price);

  const listingId = await ctx.marketplace.nextListingId();

  await ctx.marketplace
    .connect(ctx.buyer)
    .buySAL(listingId, amount, { value: amount * price });

  await ctx.salToken
    .connect(ctx.buyer)
    .setApprovalForAll(await ctx.marketplace.getAddress(), true);

  return listingId;
}

async function signCertificateAuthorization(
  ctx,
  {
    retirer = ctx.buyer,
    projectIds,
    salAmounts,
    certificateURI = CERT_URI,
    signer = ctx.metadataSigner,
    deadlineOffset = 3600n,
  } = {}
) {
  const nonce = await ctx.marketplace.certificateNonces(retirer.address);
  const latestBlock = await ethers.provider.getBlock("latest");
  const deadline = BigInt(latestBlock.timestamp) + deadlineOffset;
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const domain = {
    name: "SALMarketplace",
    version: "1",
    chainId,
    verifyingContract: await ctx.marketplace.getAddress(),
  };

  const types = {
    CertificateMetadata: [
      { name: "retirer", type: "address" },
      { name: "projectIds", type: "uint256[]" },
      { name: "salAmounts", type: "uint256[]" },
      { name: "uriHash", type: "bytes32" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    retirer: retirer.address,
    projectIds,
    salAmounts,
    uriHash: ethers.keccak256(ethers.toUtf8Bytes(certificateURI)),
    nonce,
    deadline,
  };

  const signature = await signer.signTypedData(domain, types, value);

  return {
    deadline,
    signature,
    nonce,
    certificateURI,
  };
}

describe("CarboX SAL v2 - multi-project retirement", function () {
  it("vẫn retire được 1 dự án bằng flow mới dạng mảng", async function () {
    const ctx = await deployAll();
    const projectId = await submitAndApprove(ctx);
    await createListingAndBuy(ctx, projectId, 10n);

    const projectIds = [projectId];
    const salAmounts = [10n];
    const auth = await signCertificateAuthorization(ctx, {
      projectIds,
      salAmounts,
    });

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        projectIds,
        salAmounts,
        auth.certificateURI,
        auth.deadline,
        auth.signature,
        { value: CERTIFICATE_MINT_FEE }
      )
    )
      .to.emit(ctx.marketplace, "SALRetired")
      .and.to.emit(ctx.marketplace, "MultiProjectSALRetired");

    expect(await ctx.salToken.balanceOf(ctx.buyer.address, projectId)).to.equal(0n);
    expect(await ctx.certificateSBT.ownerOf(1n)).to.equal(ctx.buyer.address);

    const info = await ctx.certificateSBT.certificates(1n);
    expect(info.projectId).to.equal(projectId);
    expect(info.retiredSALAmount).to.equal(10n);
    expect(info.retiredCO2Kg).to.equal(100n);
    expect(info.projectCount).to.equal(1n);
    expect(info.certificateURI).to.equal(CERT_URI);

    const [storedProjectIds, storedSALAmounts] =
      await ctx.certificateSBT.getCertificateComposition(1n);

    expect(storedProjectIds).to.deep.equal(projectIds);
    expect(storedSALAmounts).to.deep.equal(salAmounts);
  });

  it("retire SAL từ nhiều dự án và chỉ mint 1 SBT", async function () {
    const ctx = await deployAll();

    const project1 = await submitAndApprove(ctx, {
      projectURI: "ipfs://QmProjectOne123",
    });
    const project2 = await submitAndApprove(ctx, {
      projectURI: "ipfs://QmProjectTwo123",
    });
    const project3 = await submitAndApprove(ctx, {
      projectURI: "ipfs://QmProjectThree123",
    });

    await createListingAndBuy(ctx, project1, 2n);
    await createListingAndBuy(ctx, project2, 3n);
    await createListingAndBuy(ctx, project3, 5n);

    const projectIds = [project1, project2, project3];
    const salAmounts = [2n, 3n, 5n];

    const auth = await signCertificateAuthorization(ctx, {
      projectIds,
      salAmounts,
    });

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        projectIds,
        salAmounts,
        CERT_URI,
        auth.deadline,
        auth.signature,
        { value: CERTIFICATE_MINT_FEE }
      )
    ).to.emit(ctx.marketplace, "MultiProjectSALRetired");

    expect(await ctx.salToken.balanceOf(ctx.buyer.address, project1)).to.equal(0n);
    expect(await ctx.salToken.balanceOf(ctx.buyer.address, project2)).to.equal(0n);
    expect(await ctx.salToken.balanceOf(ctx.buyer.address, project3)).to.equal(0n);

    // One retirement basket => one Soulbound certificate.
    expect(await ctx.certificateSBT.ownerOf(1n)).to.equal(ctx.buyer.address);
    await expect(ctx.certificateSBT.ownerOf(2n)).to.revert(ethers);

    const info = await ctx.certificateSBT.certificates(1n);
    expect(info.projectId).to.equal(0n); // 0 means multi-project certificate.
    expect(info.retiredSALAmount).to.equal(10n);
    expect(info.retiredCO2Kg).to.equal(100n);
    expect(info.projectCount).to.equal(3n);

    const [storedProjectIds, storedSALAmounts] =
      await ctx.certificateSBT.getCertificateComposition(1n);

    expect(storedProjectIds).to.deep.equal(projectIds);
    expect(storedSALAmounts).to.deep.equal(salAmounts);
  });

  it("không cho retire quá 5 dự án", async function () {
    const ctx = await deployAll();

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        [1n, 2n, 3n, 4n, 5n, 6n],
        [1n, 1n, 1n, 1n, 1n, 1n],
        CERT_URI,
        99999999999n,
        "0x",
        { value: CERTIFICATE_MINT_FEE }
      )
    ).to.be.revertedWith("SALMarketplace: maximum 5 retirement projects");
  });

  it("không cho lặp cùng projectId trong một certificate", async function () {
    const ctx = await deployAll();
    const projectId = await submitAndApprove(ctx);
    await createListingAndBuy(ctx, projectId, 2n);

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        [projectId, projectId],
        [1n, 1n],
        CERT_URI,
        99999999999n,
        "0x",
        { value: CERTIFICATE_MINT_FEE }
      )
    ).to.be.revertedWith("SALMarketplace: duplicate retirement project");
  });

  it("từ chối metadata do signer không được tin cậy ký", async function () {
    const ctx = await deployAll();
    const projectId = await submitAndApprove(ctx);
    await createListingAndBuy(ctx, projectId, 1n);

    const projectIds = [projectId];
    const salAmounts = [1n];

    const auth = await signCertificateAuthorization(ctx, {
      projectIds,
      salAmounts,
      signer: ctx.outsider,
    });

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        projectIds,
        salAmounts,
        CERT_URI,
        auth.deadline,
        auth.signature,
        { value: CERTIFICATE_MINT_FEE }
      )
    ).to.be.revertedWith("SALMarketplace: invalid metadata signature");
  });

  it("không thể dùng lại chữ ký metadata vì nonce tăng sau mỗi lần retire", async function () {
    const ctx = await deployAll();
    const projectId = await submitAndApprove(ctx);
    await createListingAndBuy(ctx, projectId, 2n);

    const projectIds = [projectId];
    const salAmounts = [1n];
    const auth = await signCertificateAuthorization(ctx, { projectIds, salAmounts });

    await ctx.marketplace.connect(ctx.buyer).retireSAL(
      projectIds,
      salAmounts,
      CERT_URI,
      auth.deadline,
      auth.signature,
      { value: CERTIFICATE_MINT_FEE }
    );

    await expect(
      ctx.marketplace.connect(ctx.buyer).retireSAL(
        projectIds,
        salAmounts,
        CERT_URI,
        auth.deadline,
        auth.signature,
        { value: CERTIFICATE_MINT_FEE }
      )
    ).to.be.revertedWith("SALMarketplace: invalid metadata signature");
  });

  it("quorum được snapshot theo từng dự án và không đổi khi danh sách validator thay đổi", async function () {
    const ctx = await deployAll();
    await ctx.marketplace.addValidator(ctx.validator2.address);

    await ctx.marketplace.connect(ctx.projectOwner).submitProject(
      PROJECT_URI,
      PROPOSED_CO2_KG,
      { value: TOKENIZATION_DEPOSIT }
    );

    expect(await ctx.marketplace.projectEligibleValidatorCount(1n)).to.equal(2n);
    expect(await ctx.marketplace.projectApprovalQuorum(1n)).to.equal(2n);

    await ctx.marketplace.addValidator(ctx.outsider.address);
    expect(await ctx.marketplace.projectEligibleValidatorCount(1n)).to.equal(2n);
    expect(await ctx.marketplace.projectApprovalQuorum(1n)).to.equal(2n);

    await ctx.marketplace.connect(ctx.owner).voteOnProject(1n, true);
    await ctx.marketplace.connect(ctx.validator2).voteOnProject(1n, true);
    await ctx.marketplace.approveAndMintSAL(1n, APPROVED_CO2_KG, PROJECT_URI);
  });

  it("không cho submit nếu không có validator độc lập", async function () {
    const ctx = await deployAll();

    await expect(
      ctx.marketplace.connect(ctx.owner).submitProject(
        PROJECT_URI,
        PROPOSED_CO2_KG,
        { value: TOKENIZATION_DEPOSIT }
      )
    ).to.be.revertedWith("SALMarketplace: no independent validator available");
  });

  it("pause chặn nghiệp vụ mới nhưng vẫn có thể unpause để tiếp tục", async function () {
    const ctx = await deployAll();
    await ctx.marketplace.pause();

    await expect(
      ctx.marketplace.connect(ctx.projectOwner).submitProject(
        PROJECT_URI,
        PROPOSED_CO2_KG,
        { value: TOKENIZATION_DEPOSIT }
      )
    ).to.be.revertedWithCustomError(ctx.marketplace, "EnforcedPause");

    await ctx.marketplace.unpause();
    await ctx.marketplace.connect(ctx.projectOwner).submitProject(
      PROJECT_URI,
      PROPOSED_CO2_KG,
      { value: TOKENIZATION_DEPOSIT }
    );
  });

  it("blacklist project chặn mua/retire nhưng người bán vẫn hủy listing lấy SAL về", async function () {
    const ctx = await deployAll();
    const projectId = await submitAndApprove(ctx);
    const price = ethers.parseEther("0.01");

    await ctx.salToken
      .connect(ctx.projectOwner)
      .setApprovalForAll(await ctx.marketplace.getAddress(), true);

    await ctx.marketplace
      .connect(ctx.projectOwner)
      .createListing(projectId, 20n, price);

    await ctx.marketplace.blacklistProject(projectId, "verification revoked");

    await expect(
      ctx.marketplace.connect(ctx.buyer).buySAL(1n, 1n, { value: price })
    ).to.be.revertedWith("SALMarketplace: project blacklisted");

    await ctx.marketplace.connect(ctx.projectOwner).cancelListing(1n);
    expect(await ctx.salToken.balanceOf(ctx.projectOwner.address, projectId)).to.equal(SAL_AMOUNT);
  });

  it("blacklist owner chặn submit", async function () {
    const ctx = await deployAll();
    await ctx.marketplace.blacklistOwner(ctx.outsider.address, "fraud risk");

    await expect(
      ctx.marketplace.connect(ctx.outsider).submitProject(
        PROJECT_URI,
        PROPOSED_CO2_KG,
        { value: TOKENIZATION_DEPOSIT }
      )
    ).to.be.revertedWith("SALMarketplace: address is blacklisted");
  });

  it("marketplace address được khóa sau deployment", async function () {
    const ctx = await deployAll();

    await expect(
      ctx.salToken.setMarketplace(ctx.outsider.address)
    ).to.be.revertedWith("SAL1155: marketplace is locked");

    await expect(
      ctx.certificateSBT.setMarketplace(ctx.outsider.address)
    ).to.be.revertedWith("GreenCertificateSBT: marketplace is locked");
  });
});
