"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { getBank, getBankByAccountId } from "@/lib/actions/user.actions";
import { decryptId } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { BankDropdown } from "./BankDropdown";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(4, "Transfer note is too short"),
  amount: z.string().min(4, "Amount is too short"),
  senderBank: z.string().min(4, "Please select a valid bank account"),
  sharableId: z.string().min(8, "Please select a valid sharable Id"),
});

// `userId` is a relationship column on the banks table, but Appwrite returns it
// as a bare id rather than the expanded user row. Handle both shapes so this
// doesn't break if relationship expansion is ever turned on.
const userIdOf = (bank: Bank) =>
  typeof bank.userId === "string"
    ? bank.userId
    : (bank.userId as unknown as { $id: string }).$id;

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      // The dropdown renders accounts[0] as pre-selected, so submit that unless
      // the user picks something else — otherwise the form fails validation on
      // a bank the user can see is already chosen.
      senderBank: accounts[0]?.appwriteItemId ?? "",
      sharableId: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const receiverAccountId = decryptId(data.sharableId);
      const receiverBank = await getBankByAccountId({
        accountId: receiverAccountId,
      });
      const senderBank = await getBank({ documentId: data.senderBank });

      if (!receiverBank) {
        throw new Error(
          "We couldn't find an account for that sharable id. Please double-check it."
        );
      }

      if (!senderBank) {
        throw new Error("We couldn't find the bank account you selected.");
      }

      const transferParams = {
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: data.amount,
      };
      // create transfer
      const transfer = await createTransfer(transferParams);

      // create transfer transaction
      if (!transfer) {
        throw new Error("The transfer was declined. Please try again.");
      }

      const transaction = {
        name: data.name,
        amount: data.amount,
        senderId: userIdOf(senderBank),
        senderBankId: senderBank.$id,
        receiverId: userIdOf(receiverBank),
        receiverBankId: receiverBank.$id,
        email: data.email,
      };

      await createTransaction(transaction);

      form.reset();
      router.push(`/?id=${senderBank.$id}`);
    } catch (error) {
      console.error("Submitting create transfer request failed: ", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the transfer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
      <Controller
        control={form.control}
        name="senderBank"
        render={({ fieldState }) => (
          <Field
            data-invalid={!!fieldState.error}
            className="border-t border-gray-200"
          >
            <div className="payment-transfer_form-item pb-6 pt-5">
              <div className="payment-transfer_form-content">
                <FieldLabel className="text-14 font-medium text-gray-700">
                  Select Source Bank
                </FieldLabel>
                <FieldDescription className="text-12 font-normal text-gray-600">
                  Select the bank account you want to transfer funds from
                </FieldDescription>
              </div>
              <FieldContent className="flex w-full flex-col">
                <BankDropdown
                  accounts={accounts}
                  setValue={form.setValue}
                  otherStyles="!w-full"
                />
                <FieldError
                  className="text-12 text-red-500"
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </FieldContent>
            </div>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={!!fieldState.error}
            className="border-t border-gray-200"
          >
            <div className="payment-transfer_form-item pb-6 pt-5">
              <div className="payment-transfer_form-content">
                <FieldLabel
                  htmlFor="name"
                  className="text-14 font-medium text-gray-700"
                >
                  Transfer Note (Optional)
                </FieldLabel>
                <FieldDescription className="text-12 font-normal text-gray-600">
                  Please provide any additional information or instructions
                  related to the transfer
                </FieldDescription>
              </div>
              <FieldContent className="flex w-full flex-col">
                <Textarea
                  id="name"
                  placeholder="Write a short note here"
                  className="input-class"
                  {...field}
                />
                <FieldError
                  className="text-12 text-red-500"
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </FieldContent>
            </div>
          </Field>
        )}
      />

      <div className="payment-transfer_form-details">
        <h2 className="text-18 font-semibold text-gray-900">
          Bank account details
        </h2>
        <p className="text-16 font-normal text-gray-600">
          Enter the bank account details of the recipient
        </p>
      </div>

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={!!fieldState.error}
            className="border-t border-gray-200"
          >
            <div className="payment-transfer_form-item py-5">
              <FieldLabel
                htmlFor="email"
                className="text-14 w-full max-w-[280px] font-medium text-gray-700"
              >
                Recipient&apos;s Email Address
              </FieldLabel>
              <FieldContent className="flex w-full flex-col">
                <Input
                  id="email"
                  placeholder="ex: johndoe@gmail.com"
                  className="input-class"
                  {...field}
                />
                <FieldError
                  className="text-12 text-red-500"
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </FieldContent>
            </div>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="sharableId"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={!!fieldState.error}
            className="border-t border-gray-200"
          >
            <div className="payment-transfer_form-item pb-5 pt-6">
              <FieldLabel
                htmlFor="sharableId"
                className="text-14 w-full max-w-[280px] font-medium text-gray-700"
              >
                Receiver&apos;s Plaid Sharable Id
              </FieldLabel>
              <FieldContent className="flex w-full flex-col">
                <Input
                  id="sharableId"
                  placeholder="Enter the public account number"
                  className="input-class"
                  {...field}
                />
                <FieldError
                  className="text-12 text-red-500"
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </FieldContent>
            </div>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="amount"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={!!fieldState.error}
            className="border-y border-gray-200"
          >
            <div className="payment-transfer_form-item py-5">
              <FieldLabel
                htmlFor="amount"
                className="text-14 w-full max-w-[280px] font-medium text-gray-700"
              >
                Amount
              </FieldLabel>
              <FieldContent className="flex w-full flex-col">
                <Input
                  id="amount"
                  placeholder="ex: 5.00"
                  className="input-class"
                  {...field}
                />
                <FieldError
                  className="text-12 text-red-500"
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </FieldContent>
            </div>
          </Field>
        )}
      />

      <div className="payment-transfer_btn-box">
        {submitError && (
          <p className="text-12 text-red-500">{submitError}</p>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="payment-transfer_btn"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
            </>
          ) : (
            "Transfer Funds"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PaymentTransferForm;