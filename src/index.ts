import { getContractAddress } from './notification_logic/getContractAddress.js';
import { appendToCoinsSeen } from './write_coins_seen.js';
import * as addressesSeenJson from './contract_addresses_seen.json';

async function main() {
  const addressesSeen = new Set(addressesSeenJson.seenAddresses);
  const walletAddress = 'ssssss';
  while (true) {
    const currentContractAddress: string | null = await getContractAddress();

    if (!currentContractAddress) {
      console.log('No address');
    } else if (addressesSeen.has(currentContractAddress)) {
      console.log('No change detected.');
    } else {
      // Buying logic
      // Write to coins_seen
      addressesSeen.add(currentContractAddress);
      await appendToCoinsSeen(addressesSeen);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
main();
