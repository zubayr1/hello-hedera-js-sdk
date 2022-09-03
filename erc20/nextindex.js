console.clear();
require("dotenv").config();
const {
	Client,
	AccountId,
	PrivateKey,
	TokenCreateTransaction,
	FileCreateTransaction,
	FileAppendTransaction,
	ContractCreateTransaction,
	ContractFunctionParameters,
	TokenUpdateTransaction,
	ContractExecuteTransaction,
	TokenInfoQuery,
	AccountBalanceQuery,
	Hbar,
} = require("@hashgraph/sdk");


async function main() {

    console.log("-------------------------------------Running Next Index-------------------------------------");
    console.log('step 4');

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
    const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
    const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
    const aliceId = AccountId.fromString(process.env.ALICE_ID);
    const aliceyKey = PrivateKey.fromString(process.env.ALICE_PVKEY);

    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    
	const tokenId = '0.0.48153799';

    
	
	const contractId = '0.0.48153801';
	// const contractAddress = contractId.toSolidityAddress();
	console.log(`- The smart contract ID is: ${contractId}`);
	// console.log(`- The smart contract ID in Solidity format is: ${contractAddress} \n`);

	// Token query 2.1
	const tokenInfo2p1 = await tQueryFcn(tokenId);
	console.log(`- Token supply key: ${tokenInfo2p1.supplyKey.toString()}`);




	// STEP 4 ===================================
	console.log(`STEP 4 ===================================`);
	//Execute a contract function (mint) MINT
	const contractExecTx = await new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(3000000)
		.setFunction("mintFungibleToken", new ContractFunctionParameters().addUint64(200));
	const contractExecSubmit = await contractExecTx.execute(client);
	const contractExecRx = await contractExecSubmit.getReceipt(client);
	console.log(`- New tokens minted: ${contractExecRx.status.toString()}`);

	// Token query 3
	const tokenInfo3 = await tQueryFcn(tokenId);
	console.log(`- New token supply: ${tokenInfo3.totalSupply.low} \n`);

	//Execute a contract function (associate) ASSOCIATE
	// const contractExecTx1 = await new ContractExecuteTransaction()
	// 	.setContractId(contractId)
	// 	.setGas(3000000)
	// 	.setFunction(
	// 		"tokenAssociate",
	// 		new ContractFunctionParameters().addAddress(aliceId.toSolidityAddress())
	// 	)
	// 	.freezeWith(client);
	// const contractExecSign1 = await contractExecTx1.sign(aliceyKey);
	// const contractExecSubmit1 = await contractExecSign1.execute(client);
	// const contractExecRx1 = await contractExecSubmit1.getReceipt(client);
	// console.log(`- Token association with Alice's account: ${contractExecRx1.status.toString()} \n`);

	//Execute a contract function (transfer)  TRANSFER
	const contractExecTx2 = await new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(3000000)
		.setFunction(
			"tokenTransfer",
			new ContractFunctionParameters()
				.addAddress(treasuryId.toSolidityAddress())
				.addAddress(aliceId.toSolidityAddress())
				.addInt64(30)
		)
		.freezeWith(client);
	const contractExecSign2 = await contractExecTx2.sign(treasuryKey);
	const contractExecSubmit2 = await contractExecSign2.execute(client);
	const contractExecRx2 = await contractExecSubmit2.getReceipt(client);

	console.log(`- Token transfer from Treasury to Alice: ${contractExecRx2.status.toString()}`);

	const tB = await bCheckerFcn(treasuryId);
	const aB = await bCheckerFcn(aliceId);
	console.log(`- Treasury balance: ${tB} units of token ${tokenId}`);
	console.log(`- Alice balance: ${aB} units of token ${tokenId} \n`);

	// ========================================
	// FUNCTIONS
	async function tQueryFcn(tId) {
		let info = await new TokenInfoQuery().setTokenId(tId).execute(client);
		return info;
	}

	async function bCheckerFcn(aId) {
		let balanceCheckTx = await new AccountBalanceQuery().setAccountId(aId).execute(client);
		return balanceCheckTx.tokens._map.get(tokenId.toString());
	}
}
main();