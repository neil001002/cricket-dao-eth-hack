async function main() {
  // This function deploys all the contracts related to this workshop

  // Deploy the NFT contract
  const cricketDaoNftAddress = await deployCricketDaoNFT();
  console.log(`Deployed CricketDaoNFT contract at address: ${cricketDaoNftAddress}`);

  // Deploy the Fake NFT Marketplace contract
  const nftMarketplaceAddress = await deployNFTMarketplace();
  console.log(`Deployed NFTMarketplace at address: ${nftMarketplaceAddress}`);

  const cricketDaoAddress = await deployCricketDAO(cricketDaoNftAddress, nftMarketplaceAddress);

  console.log(`Deployed CricketDAO contract at address: ${cricketDaoAddress}`);
}

async function deployCricketDAO(nftContract, marketplaceContract) {
  const DAO = await ethers.getContractFactory("CricketDAO");

  // Deploy the contract and pass it 0.1 ETH to fund the treasury initially
  const cricketDAO = await DAO.deploy(nftContract, marketplaceContract);

  await cricketDAO.deployed();

  return cricketDAO.address;
}

async function deployNFTMarketplace() {
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  return nftMarketplace.address;
}

async function deployCricketDaoNFT() {
  const NFT = await ethers.getContractFactory("CricketDaoNFT");
  const cricketDaoNFT = await NFT.deploy();

  await cricketDaoNFT.deployed();

  return cricketDaoNFT.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
