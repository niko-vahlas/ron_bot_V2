import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

export async function getTokenBalance(
  walletAddress: string,
  tokenMintAddress: string
) {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Fetch all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      {
        mint: tokenMintPublicKey,
      }
    );

    if (tokenAccounts.value.length === 0) {
      console.log(`No token accounts found for token: ${tokenMintAddress}`);
      return 0;
    }

    // Assuming only one account per token mint; adjust if multiple accounts exist
    const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
    const balance = tokenAccountInfo.tokenAmount.uiAmount;

    console.log(`Balance for token ${tokenMintAddress}: ${balance}`);
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return null;
  }
}
