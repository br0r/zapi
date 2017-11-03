import * as <%= title %>Controller from './<%= title %>/controller';

api.get('/<%= title %>', <%= title %>Controller.index);
api.post('/<%= title %>', <%= title %>Controller.create);
api.get('/<%= title %>/:id', <%= title %>Controller.show);
api.patch('/<%= title %>/:id', <%= title %>Controller.update);
api.delete('/<%= title %>/:id', <%= title %>Controller.remove);
