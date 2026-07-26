"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const { database } = await createAdminClient();

    const newTransaction = await database.createRow({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      rowId: ID.unique(),
      data: {
        channel: 'online',
        category: 'Transfer',
        ...transaction,
      },
    });

    // The home page renders the transaction list from a cached server render —
    // without this the new transfer is invisible until a hard refresh.
    revalidatePath("/");

    return parseStringify(newTransaction);
  } catch (error) {
    // Don't swallow this. The caller only redirects when a transaction comes
    // back, so a silent failure looks like "nothing happened" in the UI even
    // though the Dwolla transfer already went through.
    console.error("An error occurred while creating the transaction:", error);
    throw error;
  }
}

export const getTransactionsByBankId = async ({ bankId }: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listRows({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      queries: [Query.equal("senderBankId", bankId)],
    });

    const receiverTransactions = await database.listRows({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      queries: [Query.equal("receiverBankId", bankId)],
    });

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      rows : [...senderTransactions.rows, ...receiverTransactions.rows],
    };

    return parseStringify(transactions);
  } catch (error) {
    // Don't return undefined here — callers read `.rows` off the result, and a
    // swallowed error turns into a confusing TypeError far from the real cause.
    console.error("An error occurred while getting the transactions:", error);
    throw error;
  }
}
