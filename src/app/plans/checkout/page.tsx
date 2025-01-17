// src/app/checkout/page.tsx
import { CheckoutForm } from "@/components/checkout-form"

const CheckoutPage = () => {
    // Here you would be getting the basked etc.
    // We're hard-coding the oruce for simplicity
    const priceId = process.env.PRICE_ID!

    return (
        <main>
            <div className="max-w-screen-lg mx-auto my-8">
              <CheckoutForm priceId={priceId}/>
            </div>
        </main>
    )
}

export default CheckoutPage
