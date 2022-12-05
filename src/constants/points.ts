import { deepFreeze } from '../helper/deepFreeze.js'

const Points = {
    AUDIO_LISTENED: 50,
    PROFILE_EDITED: 50,
    FOOTPRINT_REACTION: 150,
    NEW_FRIENDSHIP: 250,
    FOOTPRINT_CREATED: 300,
    FOOTPRINT_VIEWED: 500,
}

export default deepFreeze(Points) as typeof Points
