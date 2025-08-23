export default class ScoreHandler {
  constructor() {
    this.DBWOScore = [];
    this.isLocalStorageAvailable = null;
    this.keyData = "DBWOScore";
    this.bestScore = {};
  }

  exportToCSV = () => {
    if (this.DBWOScore.length === 0) return;
    
    const headers = ['ID', 'Workout Name', 'Duration', 'Repetition', 'Date'];
    const csvRows = [
      headers.join(','),
      ...this.DBWOScore.map(row => [
        row.id,
        row.nameWorkout,
        row.duration,
        row.repetition,
        row.date
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'workout_scores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  setup = (bestScoreConfig) => {
    // Create schema DB Best score and set 0 for every entity
    this.bestScore = {};
    bestScoreConfig.nameWorkout.forEach((workout) => {
      this.bestScore[workout] = {};
      bestScoreConfig.duration.forEach((dur) => {
        this.bestScore[workout][dur] = 0;
      });
    });

    if (typeof localStorage === "undefined") {
      this.isLocalStorageAvailable = false;
      // eslint-disable-next-line no-alert
      alert("Warning! Local storage unavailable. Please use newest browser");
      return;
    }
    this.isLocalStorageAvailable = true;
    const DBWOScoreStringify = localStorage.getItem(this.keyData);
    if (DBWOScoreStringify !== null) {
      this.DBWOScore = JSON.parse(DBWOScoreStringify);
    } else {
      this.saveToLocalStorage();
    }
  };

  saveToLocalStorage = () => {
    if (this.isLocalStorageAvailable) {
      localStorage.setItem(this.keyData, JSON.stringify(this.DBWOScore));
    }
  };

  addNewData = (inputData) => {
    this.DBWOScore.push({
      id: +new Date(),
      nameWorkout: inputData.nameWorkout,
      duration: inputData.duration,
      repetition: inputData.repetition,
      date: new Date().toLocaleString(),
    });

    this.saveToLocalStorage();
  };

  getBestScoreByReps = () => {
    if (Object.keys(this.bestScore).length === 0) return {};
    // Search maximum score with compare each other
    this.DBWOScore.forEach((dataWO) => {
      if (
        this.bestScore[dataWO.nameWorkout][dataWO.duration] === 0 ||
        dataWO.repetition >= this.bestScore[dataWO.nameWorkout][dataWO.duration]
      ) {
        this.bestScore[dataWO.nameWorkout][dataWO.duration] = dataWO.repetition;
      }
    });
    return this.bestScore;
  };

  exportBestScoresToCSV = () => {
    const bestScore = this.getBestScoreByReps();
    if (Object.keys(bestScore).length === 0) return;
    
    const headers = ['Workout Name', 'Duration', 'Best Repetition'];
    const csvRows = [headers.join(',')];
    
    Object.keys(bestScore).forEach((workout) => {
      Object.keys(bestScore[workout]).forEach((duration) => {
        csvRows.push([workout, duration, bestScore[workout][duration]].join(','));
      });
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'best_scores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}
