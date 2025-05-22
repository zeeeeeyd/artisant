const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const postValidation = require('../validations/post.validation');
const postController = require('../controllers/post.controller');
const { upload } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .post(auth('createPost'), validate(postValidation.createPost), postController.createPost)
  .get(validate(postValidation.getPosts), postController.getPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), postController.getPost)
  .put(auth('updatePost'), validate(postValidation.updatePost), postController.updatePost)
  .delete(auth('deletePost'), validate(postValidation.deletePost), postController.deletePost);

router
  .route('/:postId/media')
  .post(
    auth('updatePost'),
    validate(postValidation.uploadMedia),
    upload.array('media', 10),
    postController.uploadMedia
  );

router
  .route('/:postId/media/:mediaId')
  .delete(
    auth('updatePost'),
    validate(postValidation.deleteMedia),
    postController.deleteMedia
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and retrieval
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     description: Only artisans can create posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - price
 *               - paymentMethod
 *               - delivery
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [image, video]
 *                     public_id:
 *                       type: string
 *               type:
 *                 type: string
 *                 enum: [vente, commande]
 *               price:
 *                 type: number
 *                 minimum: 0
 *               paymentMethod:
 *                 type: string
 *                 enum: [main à main, en ligne]
 *               delivery:
 *                 type: string
 *                 enum: [disponible, retrait sur place]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all posts
 *     description: Anyone can retrieve posts, with optional filters.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: artisan
 *         schema:
 *           type: string
 *         description: Artisan id
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Post title
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vente, commande]
 *         description: Post type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [couture, cuisine, peinture, électricité]
 *         description: Post category
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [main à main, en ligne]
 *         description: Payment method
 *       - in: query
 *         name: delivery
 *         schema:
 *           type: string
 *           enum: [disponible, retrait sur place]
 *         description: Delivery option
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. price:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of posts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post
 *     description: Anyone can get post information.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a post
 *     description: Artisans can only update their own posts. Admins can update any post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [image, video]
 *                     public_id:
 *                       type: string
 *               type:
 *                 type: string
 *                 enum: [vente, commande]
 *               price:
 *                 type: number
 *                 minimum: 0
 *               paymentMethod:
 *                 type: string
 *                 enum: [main à main, en ligne]
 *               delivery:
 *                 type: string
 *                 enum: [disponible, retrait sur place]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a post
 *     description: Artisans can only delete their own posts. Admins can delete any post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /posts/{id}/media:
 *   post:
 *     summary: Upload media to a post
 *     description: Artisans can only upload media to their own posts. Admins can upload to any post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /posts/{id}/media/{mediaId}:
 *   delete:
 *     summary: Delete media from a post
 *     description: Artisans can only delete media from their own posts. Admins can delete from any post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Media id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */