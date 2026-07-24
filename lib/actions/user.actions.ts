'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("userId", [userId])],
    });

    const userRow = user.rows[0];
    if (!userRow) return null;

    return parseStringify({
      ...userRow,
      name: userRow.name || `${userRow.firstName} ${userRow.lastName}`,
    });
  } catch (error) {
    console.error("Error", error);
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId })

    return parseStringify(user);
  } catch (error) {
    console.error('Error', error);
  }
}


export const signUp = async (userData: SignUpParams) => {
    const {email, password, firstName, lastName} = userData

    try{
        // Create a user account
        const { account, database } = await createAdminClient();

        const newUserAccount = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
        );

        const { password: _password, ...userDataWithoutPassword } = userData;

        const newUser = await database.createRow({
            databaseId: process.env.APPWRITE_DATABASE_ID!,
            tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
            rowId: ID.unique(),
            data: {
                ...userDataWithoutPassword,
                name: `${firstName} ${lastName}`,
                userId: newUserAccount.$id,
                dwollaCustomerId: '',
                dwollaCustomerUrl: '',
            },
        });

        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

    return parseStringify(newUser);
    } catch (error) {
        console.log('Error', error);
    }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id})

    return parseStringify(user);
  } catch (error) {
    // console.log(error)
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    (await cookies()).delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}