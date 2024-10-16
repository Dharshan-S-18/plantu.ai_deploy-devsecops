import OrgAccount from '../models/orgAccount';

export const generateUniqueAccountId = async () => {
    while (true) {
        // Generate a 4-digit number
        const accountId = Math.floor(1000 + Math.random() * 9000).toString();

        // Check if this accountId already exists
        const accountExists = await OrgAccount.findOne({ accountId });
        if (!accountExists) {
            return accountId;
        }
        // If the account ID exists, the loop continues and generates a new number
    }
};
