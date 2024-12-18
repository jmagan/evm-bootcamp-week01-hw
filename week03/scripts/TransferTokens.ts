import {
  formatEther,
  parseEther,
  Hex,
  hexToString,
  http,
} from "viem";
import { abi, bytecode } from "../artifacts/contracts/MyERC20Votes.sol/MyToken.json";
import { getClientsAccts } from "./sharedUtils";

// contract address 0xE366C5a151e568eCBC46894E0791E8327b5310f8
// npx ts-node --files ./scripts/TransferTokens.ts 0xE366C5a151e568eCBC46894E0791E8327b5310f8 <address to transfer to> <# tokens to transfer>
async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 3)
        throw new Error("Required parameters not provided: <contract address> <address to transfer to> <# tokens to transfer>");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");
    const addrTransfer = parameters[1];
    const numTokensTransfer = parseEther(parameters[2]);

    const { publicClient, account, deployer } = getClientsAccts();
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number: ", blockNumber);

    // token transfer
    const transferTx = await deployer.writeContract({
        address: contractAddress,
        abi,
        functionName: "transfer",
        args: [addrTransfer, numTokensTransfer],
    });
    console.log("Transaction hash:", transferTx);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transferTx });
    console.log("Transaction confirmed. Receipt:", receipt);
    console.log(`Transferred ${numTokensTransfer} tokens to ${addrTransfer}`);

    // Checking vote power - transferor address
    const votes1 = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "getVotes",
        args: [deployer.account.address],
    })) as bigint;

    console.log(
      `Transferor account ${deployer.account.address}
      has ${formatEther(votes1)} units of voting power after sending the transfer\n`
    );

    // Checking vote power - transferee address
    const votes2 = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "getVotes",
        args: [addrTransfer],
    })) as bigint;

    console.log(
      `Transferee account ${addrTransfer}
      has ${formatEther(votes2)} units of voting power after receiving the transfer\n`
    );


}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
