/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service status
 *
 * /digest:
 *   get:
 *     summary: Clustered news digest
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Array of clusters with articles
 *
 * /topics:
 *   get:
 *     summary: List distinct topics
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Topic names
 *
 * /topic/{name}:
 *   get:
 *     summary: Articles for a topic
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles
 *
 * /article/{id}:
 *   get:
 *     summary: Single article
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article
 *       404:
 *         description: Not found
 */

export {};
