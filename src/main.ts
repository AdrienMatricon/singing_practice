
import { CreditsController } from "./controllers/CreditsController";
import { ExerciseHistoryController } from "./controllers/ExerciseHistoryController";
import { ExerciseSelectionController } from "./controllers/ExerciseSelectionController";
import { LanguageSelectionController } from "./controllers/LanguageSelectionController";
import { initializeTranslation } from "./i18n/translate";
import { ExerciseHistory } from "./model/ExerciseHistory";
import { ActiveLanguage } from "./model/Language";
import { SavedExercises } from "./model/SavedExercises";
import { CreditsView } from "./ui/CreditsView";
import { ExerciseHistoryView } from "./ui/ExerciseHistoryView";
import { ExerciseSelectionView } from "./ui/ExerciseSelectionView";
import { LanguageSelectionView } from "./ui/LanguageSelectionView";
import { OutputView } from "./ui/OutputView";
import { SavedExercisesView } from "./ui/SavedExercisesView";

import "./style.css";
import { SavedExercisesController } from "./controllers/SavedExercisesController";
import { OutputController } from "./controllers/OutputController";


// Initialize translation
const activeLanguage = new ActiveLanguage();
initializeTranslation(activeLanguage);

// Models
const exerciseHistory = new ExerciseHistory();
const savedExercises = new SavedExercises();

// Views
const languageSelectionView
    = new LanguageSelectionView(document.querySelector("#language-selector")!);
const creditsView
    = new CreditsView(document.querySelector("#credits")!);
const exerciseSelectionView
    = new ExerciseSelectionView(document.querySelector("#exercise-selector")!);
const outputView
    = new OutputView(document.querySelector("#output")!);
const exerciseHistoryView
    = new ExerciseHistoryView(document.querySelector("#exercise-history")!);
const savedExercisesView
    = new SavedExercisesView(document.querySelector("#saved-exercises")!);

// Controllers
const languageSelectionController
    = new LanguageSelectionController(languageSelectionView, activeLanguage);
const creditsController
    = new CreditsController(creditsView, activeLanguage);
const exerciseSelectionController
    = new ExerciseSelectionController(exerciseSelectionView, activeLanguage);
const exerciseHistoryController
    = new ExerciseHistoryController(exerciseHistoryView, activeLanguage, exerciseHistory, exerciseSelectionView);
const outputController
    = new OutputController(outputView, activeLanguage, exerciseHistory, savedExercises, exerciseSelectionView);
const savedExercisesController
    = new SavedExercisesController(savedExercisesView, activeLanguage, savedExercises, exerciseSelectionView);
