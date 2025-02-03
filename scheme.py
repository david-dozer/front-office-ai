import pandas as pd
import numpy as np
from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import seaborn as sns
import matplotlib.pyplot as plt
import os
import joblib
from datetime import datetime
import gc

def create_output_directory():
    """Ensure output directory exists"""
    output_dir = "model_outputs"
    os.makedirs(output_dir, exist_ok=True)
    return output_dir

def load_and_prepare_data():
    """Load data with basic validation"""
    try:
        # Check if files exist
        for file in ["team_weekly_stats.csv", "team_seasonal_stats.csv"]:
            if not os.path.exists(f"processed_data/{file}"):
                raise FileNotFoundError(f"Missing required file: {file}")
        
        weekly_stats = pd.read_csv("processed_data/team_weekly_stats.csv")
        seasonal_stats = pd.read_csv("processed_data/team_seasonal_stats.csv")
        
        # Verify columns match
        if set(weekly_stats.columns) != set(seasonal_stats.columns):
            raise ValueError("Column mismatch between weekly and seasonal stats")
        
        team_schemes = {
            "MIN": "McVay System", "LA": "McVay System",
            "WAS": "Air Raid", "PHI": "Spread Option",
            "LAC": "Coryell Vertical", "GB": "West Coast",
            "PIT": "Run Power", "NYG": "Pistol Power Spread",
            "SF": "Shanahan Wide Zone"
        }
        
        weekly_stats["scheme"] = weekly_stats["posteam"].map(team_schemes)
        seasonal_stats["scheme"] = seasonal_stats["posteam"].map(team_schemes)
        
        weekly_stats_labeled = weekly_stats[weekly_stats["scheme"].notna()]
        seasonal_stats_labeled = seasonal_stats[seasonal_stats["scheme"].notna()]
        
        if len(weekly_stats_labeled) == 0 or len(seasonal_stats_labeled) == 0:
            raise ValueError("No labeled data found after filtering")
        
        weekly_stats_labeled['is_seasonal'] = False
        seasonal_stats_labeled['is_seasonal'] = True
        
        # Add scheme balance check
        scheme_counts = weekly_stats_labeled['scheme'].value_counts()
        print("\nSamples per scheme:")
        print(scheme_counts)
        
        if (scheme_counts < 5).any():
            print("\nWarning: Some schemes have very few samples")
        
        return pd.concat([weekly_stats_labeled, seasonal_stats_labeled]), seasonal_stats_labeled
        
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise

def prepare_features(df):
    """
    Prepare features based on offensive scheme characteristics.
    """
    try:
        features = {
            # Air Raid indicators
            'pass_heavy': df['pass_to_run'],
            'shotgun_usage': df['shotgun_freq'],
            'no_huddle_rate': df['no_huddle_freq'],
            'quick_pass_rate': df['short_passes_freq'],
            
            # West Coast indicators
            'short_pass_rate': df['short_passes_freq'],
            'yac_efficiency': df['yac'],
            'pass_run_balance': abs(0.5 - df['pass_to_run']),
            
            # Vertical/Coryell indicators
            'deep_pass_rate': df['deep_passes_freq'],
            'air_yards_avg': df['avg_air_yards'],
            'pass_epa': df['epa_pass'],
            
            # Run scheme indicators
            'inside_run_rate': df['inside_run_pct'],
            'outside_run_rate': df['outside_run_pct'],
            'run_epa': df['epa_run'],
            
            # Formation and personnel indicators
            'middle_field_usage': df['middle_passes'],
            'perimeter_usage': df['side_passes'],
            
            # QB mobility indicators
            'scramble_rate': df['scramble_freq'],
            
            # Early down tendencies
            'first_down_run_rate': df['first_down_rush_pct'],
            'early_down_efficiency': df['yards_gained_1']
        }
        
        feature_df = pd.DataFrame(features)
        
        # Handle any infinite values
        feature_df = feature_df.replace([np.inf, -np.inf], np.nan)
        feature_df = feature_df.fillna(feature_df.mean())
        
        return feature_df
        
    except Exception as e:
        print(f"Error preparing features: {str(e)}")
        raise

def train_scheme_classifier(X, y, sample_weights=None):
    """
    Train a Random Forest classifier with cross-validation and sample weights.
    """
    try:
        print(f"Training with {len(X)} samples, {X.shape[1]} features")
        print("Starting cross-validation...")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            min_samples_leaf=1,
            class_weight='balanced',
            random_state=42
        )

        # Use manual loop for LOO cross-validation since sample_weight isn't supported in cross_val_score
        loo = LeaveOneOut()
        cv_scores = []

        for train_index, test_index in loo.split(X_scaled):
            X_train, X_test = X_scaled[train_index], X_scaled[test_index]
            y_train, y_test = y.iloc[train_index], y.iloc[test_index]
            
            # Ensure sample weights align with training indices
            sample_weights_train = sample_weights.iloc[train_index] if sample_weights is not None else None
            
            rf_model.fit(X_train, y_train, sample_weight=sample_weights_train)
            score = rf_model.score(X_test, y_test)  # Evaluate accuracy
            cv_scores.append(score)

        cv_scores = np.array(cv_scores)
        print(f"\nCross-Validation Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")

        # Train final model on full data
        rf_model.fit(X_scaled, y, sample_weight=sample_weights)

        # Get feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)

        return rf_model, scaler, feature_importance

    except Exception as e:
        print(f"Error training model: {str(e)}")
        raise

def evaluate_predictions(model, X, y, scaler):
    """
    Evaluate predictions with scheme-specific metrics.
    """
    try:
        X_scaled = scaler.transform(X)
        y_pred = model.predict(X_scaled)
        y_prob = model.predict_proba(X_scaled)
        
        eval_df = pd.DataFrame({
            'Team': X.index,
            'True_Scheme': y,
            'Predicted_Scheme': y_pred,
            'Confidence': np.max(y_prob, axis=1)
        })
        
        print("\nClassification Report:")
        print(classification_report(y, y_pred))
        
        print("\nPredictions with Confidence:")
        print(eval_df.sort_values('Confidence', ascending=False))
        
        return eval_df
        
    except Exception as e:
        print(f"Error evaluating predictions: {str(e)}")
        raise

def save_model(model, scaler, timestamp, output_dir):
    """Save model and scaler with version"""
    try:
        model_path = f"{output_dir}/scheme_classifier_{timestamp}.joblib"
        scaler_path = f"{output_dir}/feature_scaler_{timestamp}.joblib"
        
        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)
        
        # Save paths for later reference
        with open(f"{output_dir}/latest_model.txt", 'w') as f:
            f.write(f"model_path: {model_path}\nscaler_path: {scaler_path}")
            
    except Exception as e:
        print(f"Error saving model: {str(e)}")
        raise

def load_latest_model(output_dir="model_outputs"):
    """Load the latest saved model and scaler"""
    try:
        with open(f"{output_dir}/latest_model.txt", 'r') as f:
            paths = dict(line.strip().split(": ") for line in f)
        
        model = joblib.load(paths['model_path'])
        scaler = joblib.load(paths['scaler_path'])
        return model, scaler
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise

def plot_feature_importance(importance, output_dir):
    """Plot and save feature importance"""
    try:
        plt.figure(figsize=(12, 8))
        sns.barplot(x='importance', y='feature', data=importance)
        plt.title("Feature Importance by Scheme Characteristic")
        plt.xlabel('Relative Importance')
        plt.ylabel('Scheme Characteristic')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/feature_importance.png")
        plt.close()
        
    except Exception as e:
        print(f"Error plotting feature importance: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        # Create output directory
        output_dir = create_output_directory()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Load and prepare data
        print("Loading data...")
        df, df_seasonal = load_and_prepare_data()
        
        # Prepare features and target
        print("Preparing features...")
        X = prepare_features(df)
        y = df['scheme']
        
        # Add is_seasonal as a feature weight
        sample_weights = df['is_seasonal'].map({True: 2.0, False: 1.0})
        
        # Train model
        print("Training model...")
        model, scaler, importance = train_scheme_classifier(X, y, sample_weights)
        
        # Plot feature importance
        plot_feature_importance(importance, output_dir)
        
        # Save model and artifacts
        print("Saving model...")
        save_model(model, scaler, timestamp, output_dir)
        importance.to_csv(f"{output_dir}/feature_importance_{timestamp}.csv")
        
        # Generate and save predictions
        print("Generating predictions...")
        eval_df = evaluate_predictions(model, X, y, scaler)
        eval_df.to_csv(f"{output_dir}/predictions_{timestamp}.csv")
        
        print(f"\nModel and artifacts saved in {output_dir}/")
        print("\nScheme Distribution:")
        print(y.value_counts())
        
        # Clear memory after training
        del df
        del df_seasonal
        gc.collect()
        
    except Exception as e:
        print(f"Error in execution: {str(e)}")
        raise
    finally:
        plt.close('all')  # Clean up any plots