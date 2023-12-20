import { Wallet, ethers } from "ethers";
import captureFlagAbi from "./abis/capture-flag.json";
import { RelayProvider } from "@loffinity/relay-provider";
import dotenv from "dotenv";
dotenv.config();

const func = async () => {
  const provider = process.env.RPC as string;
  const key = process.env.PRIVATE_KEY as string;
  const payMasterAddress = process.env.PAYMASTER_ADDRESS as string;
  const targetContractAddress = process.env.TARGET_CONTRACT_ADDRESS as string;

  const { wallet, gsnSigner } = await RelayProvider.newProviderWithOutSigning({
    privateKey: key,
    provider,
    config: {
      preferredRelays: ["http://localhost:8000"],
      useClientDefaultConfigUrl: false,
      paymasterAddress: payMasterAddress,
    },
  });

  const singer: Wallet = wallet as unknown as Wallet;

  console.log("User want to capture the flag :  ---------->", wallet.address);

  const contractCaptureFlag = new ethers.Contract(
    targetContractAddress,
    captureFlagAbi,
    singer
  );

  console.log(
    "Old Holder : ---------->",
    await contractCaptureFlag.currentHolder()
  );

  const interfaceContract = new ethers.Interface(captureFlagAbi);
  const calldata = interfaceContract.encodeFunctionData("captureTheFlag", []);
  await gsnSigner.sendTransaction({
    to: targetContractAddress,
    data: calldata,
  });

  console.log(
    "New Holder : ---------->",
    await contractCaptureFlag.currentHolder()
  );
};

func();
