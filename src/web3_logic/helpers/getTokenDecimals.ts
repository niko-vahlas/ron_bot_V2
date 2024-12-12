import { Connection, PublicKey } from '@solana/web3.js';

export async function getTokenDecimals(tokenMintAddress: string) {
  let tries = 0;
  while (tries < 3) {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');

      const mintPublicKey = new PublicKey(tokenMintAddress);

      const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);

      if (accountInfo.value && 'parsed' in accountInfo.value.data) {
        const decimals = accountInfo.value.data.parsed.info.decimals;
        console.log(`Decimals: ${decimals}`);
        return decimals;
      } else {
        console.error(
          'Unable to fetch decimals. Make sure the address is correct.'
        );
      }
    } catch (error) {
      console.error('Error fetching token decimals:', error);
    } finally {
      tries += 1;
    }
  }
  return null;
}
