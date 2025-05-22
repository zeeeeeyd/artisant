const roles = ['client', 'artisan', 'admin'];

const roleRights = new Map();

roleRights.set(roles[0], [
  'getPosts',
  'getPost',
  'createOrder',
  'getOrders',
  'getOrder',
  'updateOrder',
  'deleteOrder',
  'getUser',
  'updateUser'
]);

roleRights.set(roles[1], [
  'getPosts',
  'getPost',
  'createPost',
  'updatePost',
  'deletePost',
  'getOrders',
  'getOrder',
  'updateOrder',
  'getUser',
  'updateUser'
]);

roleRights.set(roles[2], [
  'getPosts',
  'getPost',
  'createPost',
  'updatePost',
  'deletePost',
  'getUsers',
  'getUser',
  'updateUser',
  'deleteUser',
  'getOrders',
  'getOrder',
  'updateOrder',
  'deleteOrder'
]);

module.exports = {
  roles,
  roleRights,
};