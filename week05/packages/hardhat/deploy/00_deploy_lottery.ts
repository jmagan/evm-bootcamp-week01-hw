import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, parseEther } from "ethers";

/**
 * Deploys a contract named "Lottery" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const TOKEN_NAME = "LotteryToken";
  const TOKEN_SYMBOL = "LT0";
  const BET_PRICE = "1";
  const BET_FEE = "0.2";
  const TOKEN_RATIO = 1n;

  await deploy("Lottery", {
    from: deployer,
    // Contract constructor arguments
    args: [TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_RATIO,
      parseEther(BET_PRICE),
      parseEther(BET_FEE),
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const lotteryContract = await hre.ethers.getContract<Contract>("Lottery", deployer);
  const tokenAddress = lotteryContract != null ? await lotteryContract.paymentToken() : null;
  console.log("Lottery contract deployed to address: ", lotteryContract.getAddress(), "Token address:", tokenAddress);
};

export default deployLottery;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Lottery
deployLottery.tags = ["Lottery"];
