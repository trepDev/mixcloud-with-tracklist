/**
 * Application Settings
 *
 * @typedef {Object} Settings
 * @property {boolean} [onboardingInstall] - Indicates whether the onboarding popup should be displayed after installation.
 * @property {boolean} [onboardingUpdate] - Indicates whether the onboarding popup should be displayed after an update.
 */

/**
 * Represents all the information needed and stored about a mix.
 *
 * @typedef {Object} Mix
 * @property {string} id - The ID retrieved from Mixcloud, used to identify a mix.
 * @property {string} path - The path (excluding "https://www.mixcloud.com") of a mix's webpage, used to identify the mix.
 * @property {boolean} hasBasicTracklist - Indicates the type of tracklist to display in the template (basic or complete).
 * @property {TrackInfo[]} tracklist
 */

/**
 * TrackInfo can be either {@link BasicTrackInfo} or {@link CompleteTrackInfo}, depending on how the mix author provides the information.
 *
 * @typedef {BasicTrackInfo | CompleteTrackInfo} TrackInfo
 */

/**
 * In some cases, the mix author provides information in a wrong way.
 * As a result, we can only use a basic model for track information,
 * relying on raw input for the artist's name and song name.
 *
 * @typedef {Object} BasicTrackInfo
 * @property {string} trackNumber
 * @property {string} chapter - Contains the mix author's raw input, including the artist's name and song name.
 *                              If no information is provided, this will be the string "unknown".
 */

/**
 * If mix author has correctly provided the information, we can use this complete model.
 * If some information is missing, it will be replaced with default values (see parameters documentation).
 *
 * @typedef {Object} CompleteTrackInfo
 * @property {string} trackNumber
 * @property {number} timestamp - The starting time of the track in seconds.
 * @property {string} time - A formatted time to display in template. defaults to 'not provided' if timestamp is undefined
 * @property {string} artistName - The name of the artist, defaults to 'unknown' if undefined.
 * @property {string} songName - The name of the song, defaults to 'unknown' if undefined.
 */
