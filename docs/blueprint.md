# **App Name**: Jembee Kart

## Core Features:

- Product Listing & Details: Display products in a list format with a detailed page for each product.
- Customer Login (OTP): Allow customers to log in using their mobile number with OTP authentication via Firebase.
- Profile Management: Saves the customer's profile (name, phone, role) in Firestore after OTP authentication
- Order Placement: Enable customers to fill out an order form (with autofill) and submit orders. Each order saves the userId and productId in Firestore.
- Order ID Generation: Auto-generate a random Order ID (JM-XXXXX format) before saving the order.
- Order Status Tracking: Allow customers to view the status of their orders (Confirmed, Processing, Shipped, Delivered) from their "My Orders" page.
- Product Curation Tool: A tool which uses generative AI to find possible improvements to existing product listings by, for example, checking the product titles or descriptions and making changes to optimize for clarity and search discoverability.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF), a vibrant and modern hue that aligns with a clean aesthetic. This choice reflects a sense of trust, reliability, and innovation, suitable for an e-commerce platform.
- Background color: Light blue (#E6F7FF), offering a clean, uncluttered, and trustworthy experience. Its lightness makes product imagery pop and the UI clear.
- Accent color: Light slate blue (#778899), giving calls to action such as "Add to Cart" and navigational elements an understated but definite pop.
- Font: 'Inter', a sans-serif typeface known for its clean and readable design, will be used for both headlines and body text.
- Use a set of minimalist icons for navigation and actions, ensuring clarity and a modern feel.
- Employ a grid-based layout with ample whitespace to create a clean and organized interface.
- Implement subtle transitions and loading animations to enhance the user experience without being distracting.