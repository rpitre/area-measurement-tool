import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mapper-component-toolbox-length', 'Integration | Component | mapper component toolbox length', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mapper-component-toolbox-length}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mapper-component-toolbox-length}}
      template block text
    {{/mapper-component-toolbox-length}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
