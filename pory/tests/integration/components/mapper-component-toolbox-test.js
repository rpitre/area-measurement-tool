import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mapper-component-toolbox', 'Integration | Component | mapper component toolbox', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mapper-component-toolbox}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mapper-component-toolbox}}
      template block text
    {{/mapper-component-toolbox}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
