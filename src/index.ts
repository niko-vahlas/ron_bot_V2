import { getContractAddress } from './notification_logic/getContractAddress.js';
import { appendToCoinsSeen } from './write_coins_seen.js';

async function main() {
  let lastContractAddress = null;
  const walletAddress = 'ssssss';
  while (true) {
    const currentContractAddress: string | null = await getContractAddress();

    if (!currentContractAddress) {
      console.log('No address');
    } else if (currentContractAddress === lastContractAddress) {
      console.log('No change detected.');
    } else {
      lastContractAddress = currentContractAddress;
      // Buying logic
      // Write to coins_seen

      await appendToCoinsSeen(currentContractAddress);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
main();
