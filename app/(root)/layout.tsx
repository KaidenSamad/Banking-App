import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn: User = {
    $id: '1',
    email: 'kaiden@example.com',
    userId: '1',
    dwollaCustomerUrl: '',
    dwollaCustomerId: '',
    firstName: 'Kaiden',
    lastName: 'S',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    dateOfBirth: '',
    ssn: '',
  };

  return (
    <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn} />

      <div className="flex size-full flex-col">
          <div className="root-layout">
            <Image src="/icons/logo.svg" width={30} height={30} alt="meun icon" />
            <div>
              <MobileNav user={loggedIn} />
            </div>
          </div>
          {children}
      </div>


        
    </main>
  );
}
