import pandas as pd
from scheme import load_latest_model, prepare_features

def predict_team_scheme(team="CHI"):
    """
    Predict the offensive scheme for a specific team using the trained model.
    """
    try:
        # Load the trained model and scaler
        model, scaler = load_latest_model()
        
        # Load team stats (both weekly and seasonal)
        weekly_stats = pd.read_csv("processed_data/team_weekly_stats.csv")
        seasonal_stats = pd.read_csv("processed_data/team_seasonal_stats.csv")
        
        # Filter for the team
        team_weekly = weekly_stats[weekly_stats['posteam'] == team]
        team_seasonal = seasonal_stats[seasonal_stats['posteam'] == team]
        
        if len(team_weekly) == 0:
            raise ValueError(f"No data found for team {team}")
        
        # Combine weekly and seasonal data
        team_weekly['is_seasonal'] = False
        team_seasonal['is_seasonal'] = True
        team_data = pd.concat([team_weekly, team_seasonal])
        
        # Prepare features
        X = prepare_features(team_data)
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)
        confidence_scores = probabilities.max(axis=1)
        
        # Create results DataFrame
        results = pd.DataFrame({
            'Week': team_weekly['week'] if not team_data['is_seasonal'] else 'Season Average',
            'Predicted_Scheme': predictions,
            'Confidence': confidence_scores
        })
        
        # Print summary
        print(f"\nScheme Predictions for {team}:")
        print("\nMost common predicted scheme:")
        print(predictions.mode()[0])
        print("\nConfidence by week:")
        print(results)
        
        return results
        
    except Exception as e:
        print(f"Error predicting scheme: {str(e)}")
        raise

if __name__ == "__main__":
    # Predict scheme for Chicago Bears
    results = predict_team_scheme("CHI")