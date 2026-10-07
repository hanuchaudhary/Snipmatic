import { Navbar } from "../landing/navbar";

export function AuthLayout({ children, rightMessage }: { children: React.ReactNode, rightMessage: string }) {
    const message = rightMessage.split("|");
    return (
        <div className="relative grid grid-cols-2 w-full max-w-7xl mx-auto gap-2 py-25">
            <Navbar />
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                <p className="subheading text-primary!">
                    <span>
                        {message[0]}
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                        {message[1]}
                    </span>
                </p>
            </div>
            <div className="relative mx-auto border w-full p-12">
                {children}
            </div>
        </div>
    );
}