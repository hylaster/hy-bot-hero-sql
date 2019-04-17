/**
 * Typings for the 'elo-rating' NPM module.
 */

type EloCalculation = { playerRating: number, opponentRating: number };

declare module 'elo-rating' {
  /**
   * Calculates the rating difference, capped at -400 and +400.
   * @param playerRating The player's current rating.
   * @param opponentRating The opponent's current rating.
   * @returns The rating difference.
   */
  export function ratingDifference(playerRating: number, opponentRating: number): number;

  /**
   * Calculates the expected value for the player with the given rating if he plays against an opponent with the given rating. (0 = Loss, 0.5 = Draw, 1 = Win).
   * @param playerRating The player's current rating.
   * @param opponentRating The opponent's current rating.
   * @param playerWin Whether or not the player won the match. Default is true.
   * @param k The k value to be used for rating calculation. Default is 20.
   */
  export function calculate(playerRating: number, opponentRating: number, playerWin?: boolean, k?: number): EloCalculation;
}