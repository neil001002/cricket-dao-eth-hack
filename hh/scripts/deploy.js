const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const cricketDaoNFTContractFactory = await hre.ethers.getContractFactory("CricketDaoNFT");
  const cricketDaoNFTContract = await cricketDaoNFTContractFactory.deploy();
  await cricketDaoNFTContract.deployed();
  console.log("CricketDaoNFT Contract deployed to:", cricketDaoNFTContract.address);

  console.log("Contract deployed by:", owner.address);

  let txn = await cricketDaoNFTContract.claim(3);
  await txn.wait();
  console.log("Minted NFT with ID 3");

  txn = await cricketDaoNFTContract.claim(5);
  await txn.wait();
  console.log("Minted NFT with ID 5");

  //   Trying to claim tokenID >7777 and <8001 only for owner account!
  txn = await cricketDaoNFTContract.connect(owner).ownerClaim(7778);
  await txn.wait();
  console.log("Haha I claimed owners NFT! with id 7778");

  const ownerOf = await cricketDaoNFTContract.ownerOf(3);
  await txn.wait();
  console.log("Owner of token id 3 = ", ownerOf);

  const balanceOf = await cricketDaoNFTContract.balanceOf(ownerOf);
  await txn.wait();
  console.log("%s balance is %s ", ownerOf, balanceOf);

  const totalSupply = await cricketDaoNFTContract.totalSupply();
  console.log("Total supply of dev NFT", totalSupply);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
