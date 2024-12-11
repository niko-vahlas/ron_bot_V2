import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import { transactionSenderAndConfirmationWaiter } from './helpers/transactionSender';

const connection = new Connection(
  'https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/'
);

const secretKey = Buffer.from(bs58.decode(process.env.PRIVATE_KEY || ''));
const wallet = new Wallet(Keypair.fromSecretKey(secretKey));

// Return
export async function buy(contractAddress: string) {
  const quoteResponse = await (
    await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
      &outputMint=${contractAddress}\
      &amount=100000000\
      &slippageBps=50`)
  ).json();

  const { swapTransaction } = await (
    await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
      }),
    })
  ).json();

  // Deserialize the transaction
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // Sign the transaction
  transaction.sign([wallet.payer]);

  // Prepare the serialized transaction
  const rawTransaction = Buffer.from(transaction.serialize());

  // Define blockhashWithExpiryBlockHeight (fetch it beforehand)
  const recentBlockhashInfo = await connection.getLatestBlockhash();
  const blockhashWithExpiryBlockHeight = {
    blockhash: recentBlockhashInfo.blockhash,
    lastValidBlockHeight: recentBlockhashInfo.lastValidBlockHeight,
  };

  // Use the transactionSenderAndConfirmationWaiter
  try {
    const response = await transactionSenderAndConfirmationWaiter({
      connection,
      serializedTransaction: rawTransaction,
      blockhashWithExpiryBlockHeight,
    });

    if (response) {
      console.log(
        `Transaction successful: https://solscan.io/tx/${response.transaction.signatures[0]}`
      );
      return true;
    } else {
      console.log('Transaction expired before confirmation.');
    }
  } catch (error) {
    console.error('Error sending and confirming transaction:', error);
  }
}
