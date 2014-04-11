module.exports = {
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
    {
      name: 'body',
      type: 'text',
      label: 'Body',
      sanitizers: [ 'trim' ]
    },
    {
      name: 'comment',
      type: 'text',
      label: 'Comment',
      sanitizers: [ 'trim' ]
    }
  ]
};
