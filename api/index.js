import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// add your endpoints below this line
// Get all products
app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.post('/products', async (req, res) => {
  const { name, price, category, imageUrl } = req.body;

  try {
      const newProduct = await prisma.product.create({
          data: {
              name,
              price: parseFloat(price), // Assuming price is a float
              category,
              imageUrl
          }
      });
      res.status(201).json(newProduct);
  } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
      const product = await prisma.product.findUnique({
          where: { id: parseInt(id) },
      });

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      const updatedProduct = await prisma.product.update({
          where: { id: parseInt(id) },
          data: {
              name,
              description,
              price: parseFloat(price), // Ensuring price is a float
          },
      });

      res.json(updatedProduct);
  } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const product = await prisma.product.findUnique({
          where: { id: parseInt(id) },
      });

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      await prisma.product.delete({
          where: { id: parseInt(id) },
      });

      res.status(204).json({ message: 'Product deleted' });
  } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



// Get a specific product by ID
app.get('/products/:id', async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
      const product = await prisma.product.findUnique({
          where: { id: parseInt(id) }, // Ensure the id is treated as an integer
      });

      if (product) {
          res.json(product); // Send the found product back to the client
      } else {
          res.status(404).json({ message: 'Product not found' }); // Send a 404 error if no product is found
      }
  } catch (error) {
      console.error('Failed to fetch product:', error); // Log internal server errors
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Get comments for a specific product
app.get('/products/:productId/comments', async (req, res) => {
  const { productId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        productId: parseInt(productId),
      },
      include: {
        user: true, // Assuming you want to include user details in the response
      }
    });

    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.status(404).json({ message: 'No comments found for this product.' });
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Post comments on products
app.post('/products/:productId/comments', requireAuth, async (req, res) => {
  const { content } = req.body;
  const { productId } = req.params;
  const auth0Id = req.auth.payload.sub;

  // Find the user based on Auth0 ID or return error if not found
  const user = await prisma.user.findUnique({
    where: { auth0Id }
  });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create a new comment linked to the product and user
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
      productId: parseInt(productId),
    },
  });
  res.json(comment);
});

// Update a specific comment
app.put('/comments/:commentId', requireAuth, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const auth0Id = req.auth.payload.sub;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== (await prisma.user.findUnique({ where: { auth0Id } })).id) {
      return res.status(403).json({ message: 'Unauthorized to edit this comment' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { content }
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Failed to update comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a specific comment
app.delete('/comments/:commentId', requireAuth, async (req, res) => {
  const { commentId } = req.params;
  const auth0Id = req.auth.payload.sub;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== (await prisma.user.findUnique({ where: { auth0Id } })).id) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(204).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});


app.get("/user-details", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
      const user = await prisma.user.findUnique({
          where: { auth0Id },
          include: {
              Comment: {
                  include: {
                      product: true  
                  }
              }
          }
      });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

  
      const commentCounts = user.Comment.reduce((acc, comment) => {
          const productId = comment.productId;
          if (!acc[productId]) {
              acc[productId] = { count: 0, productName: comment.product.name };
          }
          acc[productId].count += 1;
          return acc;
      }, {});

      const formattedCounts = Object.keys(commentCounts).map(productId => ({
          productId: productId,
          count: commentCounts[productId].count,
          productName: commentCounts[productId].productName  
      }));

      res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          commentCounts: formattedCounts
      });
  } catch (error) {
      console.error('Failed to fetch user details:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Update user name or email
app.put('/user/:auth0Id', async (req, res) => {
  const { auth0Id } = req.params;
  const { name, email } = req.body;

  try {
      const user = await prisma.user.update({
          where: { auth0Id: auth0Id },
          data: { name, email },
      });
      res.json(user);
  } catch (error) {
      res.status(500).send({ error: `Failed to update user: ${error.message}` });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








