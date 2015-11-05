import Ember from 'ember';

export function round2dp(params/*, hash*/)
{
    // Get the number
    let number = params[0];

    // Round it to two decimal points
    let numberRounded = Math.round(number * 100) / 100;

    return numberRounded;
}

export default Ember.Helper.helper(round2dp);
