import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CarboXSALModule", (m) => {
  const deployer = m.getAccount(0);
  const metadataSigner = m.getParameter("metadataSigner", deployer);

  const salToken = m.contract("SAL1155");
  const certificateSBT = m.contract("GreenCertificateSBT");

  const marketplace = m.contract("SALMarketplace", [
    salToken,
    certificateSBT,
    metadataSigner,
  ]);

  const setSalMarketplace = m.call(
    salToken,
    "setMarketplace",
    [marketplace]
  );

  const setCertificateMarketplace = m.call(
    certificateSBT,
    "setMarketplace",
    [marketplace]
  );

  m.call(salToken, "lockMarketplace", [], {
    after: [
      setSalMarketplace,
      setCertificateMarketplace,
    ],
  });

  m.call(certificateSBT, "lockMarketplace", [], {
    after: [
      setSalMarketplace,
      setCertificateMarketplace,
    ],
  });

  return {
    salToken,
    certificateSBT,
    marketplace,
  };
});