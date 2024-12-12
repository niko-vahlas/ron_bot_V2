import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { transactionSenderAndConfirmationWaiter } from './helpers/transactionSender.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Return
export async function swap(inputMint: string, outputMint: string) {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error('MNEMONIC environment variable is not set');
  }
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
  const keypair = Keypair.fromSeed(derived.key);
  const wallet = new Wallet(keypair);

  const quoteResponse = await (
    await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}\
      &outputMint=${outputMint}\
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
