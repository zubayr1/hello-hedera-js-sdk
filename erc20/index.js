require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,

} = require("@hashgraph/sdk");

const fs = require("fs");

const OPERATOR_ID = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const OPERATOR_PVKEY = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_PVKEY);

async function main()
{
    const contractBytecode = fs.readFileSync("LookupContract_sol_LookupContract.bin");

    const fileCreateTransaction =  new FileCreateTransaction()
    .setContents(contractBytecode)
    .setKeys([OPERATOR_PVKEY])
    // .setMaxTransactionFee(new Hbar(0.75))
    .freezeWith(client);

    const fileCreateSign = await fileCreateTransaction.sign(OPERATOR_PVKEY);

    const fileCreateSubmit = await fileCreateSign.execute(client);

    const fileCreateRx = await fileCreateSubmit.getReceipt(client);

    const bytecodeFileId = fileCreateRx.fileId;

    console.log(`bytecode file id: ${bytecodeFileId} \n`);


    //Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(100000)
    .setConstructorParameters(new ContractFunctionParameters().addString("alice").addUint256(11111));

    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    const contractId = contractInstantiateRx.contractId;

    const contractAddress = contractId.toSolidityAddress();

    console.log(`smart contract id: ${contractId}\n`);
    console.log(`smart contract address in solidity format: ${contractAddress}\n`);

    //Query contract to check changes in state variable
    const contractQueryTx = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction("getnumber", new ContractFunctionParameters().addString("alice"))
    // .setMaxQueryPayment(new Hbar(0.00000001));

    const contractQuerySubmit = await contractQueryTx.execute(client);
    const contractQueryResult = contractQuerySubmit.getUint256(0);

    console.log(`number: ${contractQueryResult}\n`);

    //Call contract funtion
    const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("setnumber", new ContractFunctionParameters().addString("bob").addUint256(22222))
    // .setMaxQueryPayment(new Hbar(0.75));

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

    console.log(`contract function call status: ${contractExecuteRx}`);

}

main();