// /src/app/checkout/success/page.tsx

const SuccessPage = () => {
    return (
        <div className="text-center space-y-4 p-8 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground">
                    Your subscription has been activated. You now have full access to ResumeLM&apos;s premium features.
                </p>
            </div>
            
            <div className="mt-6 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="space-y-2 text-sm">
                    <p>✓ Access to AI-powered resume tailoring</p>
                    <p>✓ Priority job matching algorithm</p>
                    <p>✓ Advanced analytics dashboard</p>
                </div>
            </div>
        </div>
    )
}

export default SuccessPage
