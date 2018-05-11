import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

type FormFields = 'gender' | 'age' | 'height' | 'weight' | 'activity' | 'goal';
type FormErrors = {[field in FormFields]: string};

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {

  form: FormGroup;
  showResults: Boolean = false;

  coefW = 0.45359237;
  coefH = 2.54;
  coefLiter = 0.0295735;

  gender: String = 'woman';
  bmi: number;
  waterNeed: number;
  dietDays: number;
  dietDate: any;
  calDifference: number;
  weightDifference = {
    'status': '',
    'diff': 0
  };
  idealWeight = {
    'devine': 0,
    'robinson': 0,
    'miller': 0,
    'average': 0
  };
  calories = {
    'bmr': 0,
    'maintain': 0,
    'loose1': 0,
    'loose2': 0,
    'gain1': 0,
    'gain2': 0
  };

  formErrors: FormErrors = {
    'gender': '',
    'age': '',
    'height': '',
    'weight': '',
    'activity': '',
    'goal': ''
  };

  validationMessage = {
    'age': {
      'required': 'Enter age',
      'pattern': 'Only numbers'
    },
    'height': {
      'required': 'Enter height',
      'pattern': 'Only numbers'
    },
    'weight': {
      'required': 'Enter weight',
      'pattern': 'Only numbers'
    },
    'activity': {
      'required': 'Enter activity'
    },
    'goal': {
      'required': 'Enter goal',
      'pattern': 'Only numbers'
    },
  };

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group(
      {
        'gender': [''],
        'age': ['', [
          Validators.required,
          Validators.pattern('[0-9]+')
        ]],
        'height': ['', [
          Validators.required,
          Validators.pattern('[0-9]+')
        ]],
        'weight': ['', [
          Validators.required,
          Validators.pattern('[0-9]+[\.,]*[0-9]*')
        ]],
        'activity': ['', [
          Validators.required,
        ]],
        'goal': ['', [
          Validators.required,
          Validators.pattern('[0-9]+[\.,]*[0-9]*')
        ]],
      }
    );
    this.form.valueChanges.subscribe(
      val => this.onValueChanged(val)
    );
    this.onValueChanged();
  }

  onValueChanged(val?: any) {
    if (!this.form) {
      return;
    }
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field)) {
        this.formErrors[field] = '';
        const control = this.form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessage[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] = `${(messages as {[key: string]: string})[key]}`;
              }
            }
          }
        }
      }
    }
  }

  changeGender() {
    this.gender = this.gender === 'woman' ? 'man' : 'woman';
  }

  switchCurrentWeight(event) {
    if (event.target.checked) {
      this.form.controls['goal'].setValue(this.form.value['weight']);
    } else {
      this.form.controls['goal'].setValue('');
    }
  }

  changeGoalWeight(current) {
    current.checked = false;
  }

  calcResults() {
    this.calcBmi();
    this.calcIdealWeight();
    this.calcCalories();
    this.calcWater();
    this.calcWeightDifference();
    this.calcCalDifference();
    this.calcDays();
    this.calcDate();
    this.showResults = true;
  }

  calcBmi() {
    const form = this.form.value;
    form['weight'] = +(form['weight'].replace(/,/g, '.'));
    this.bmi = +(form['weight'] / Math.pow((form['height'] / 100), 2)).toFixed(2);
  }

  calcIdealWeight() {
    const form = this.form.value;
    if (form['gender'] === 'woman') {
      this.idealWeight['devine'] =
        +((100.1 * this.coefW) + (5.06 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
      this.idealWeight['robinson'] =
        +((107.8 * this.coefW) + (3.74 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
      this.idealWeight['miller'] =
        +((116.82 * this.coefW) + (2.99 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
    } else if (form['gender'] === 'man') {
      this.idealWeight['devine'] =
        +((110 * this.coefW) + (5.06 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
      this.idealWeight['robinson'] =
        +((114.4 * this.coefW) + (4.18 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
      this.idealWeight['miller'] =
        +((123.64 * this.coefW) + (3.10 * this.coefW) * (form['height'] - (60 * this.coefH)) / this.coefH).toFixed(2);
    }
    this.idealWeight['average'] =
      +((this.idealWeight['devine'] + this.idealWeight['robinson'] + this.idealWeight['miller']) / 3).toFixed(2);
  }

  calcCalories() {
    const form = this.form.value;
    if (form['gender'] === 'woman') {
      this.calories['bmr'] = Math.round(10 * form['weight'] + 6.25 * form['height'] - 5 * form['age'] - 161);
      this.calories['maintain'] = Math.round(this.calories['bmr'] * form['activity'].replace(/,[0-9]+$/g, ''));
      this.calories['loose1'] = this.calories['maintain'] - 551;
      this.calories['loose2'] = this.calories['maintain'] - 551 * 2;
      this.calories['gain1'] = this.calories['maintain'] + 551;
      this.calories['gain2'] = this.calories['maintain'] + 551 * 2;
    } else if (form['gender'] === 'man') {
      this.calories['bmr'] = Math.round(10 * form['weight'] + 6.25 * form['height'] - 5 * form['age'] + 5);
      this.calories['maintain'] = Math.round(this.calories['bmr'] * form['activity'].replace(/,[0-9]+$/g, ''));
      this.calories['loose1'] = this.calories['maintain'] - 551;
      this.calories['loose2'] = this.calories['maintain'] - 551 * 2;
      this.calories['gain1'] = this.calories['maintain'] + 551;
      this.calories['gain2'] = this.calories['maintain'] + 551 * 2;
    }
  }

  calcWater() {
    const form = this.form.value;
    this.waterNeed =
      +((form['weight'] / this.coefW * 0.67 + +form['activity'].replace(/[0-9]+.[0-9]+,/g, '') / 7) * this.coefLiter).toFixed(2);
  }

  calcWeightDifference() {
    const form = this.form.value;
    form['goal'] = +(form['goal'].replace(/,/g, '.'));
    if (form['weight'] > form['goal']) {
      this.weightDifference['diff'] = +(form['weight'] - form['goal']).toFixed(2);
      this.weightDifference['status'] = 'loose';
    } else if (form['weight'] < form['goal']) {
      this.weightDifference['diff'] = +(form['goal'] - form['weight']).toFixed(2);
      this.weightDifference['status'] = 'gain';
    } else {
      this.weightDifference['status'] = 'maintain';
    }
  }

  calcCalDifference() {
    this.calDifference = Math.round(this.calories['maintain'] * 0.2);
  }

  calcDays() {
    const form = this.form.value;
    this.dietDays = Math.round((this.weightDifference['diff'] / this.coefW * 3500) / this.calDifference);
  }

  calcDate() {
    const fullDate = new Date(new Date().getTime() + (this.dietDays * 24 * 60 * 60 * 1000));
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    this.dietDate = `${months[fullDate.getMonth()]} ${fullDate.getDate()} ${fullDate.getFullYear()}`;
  }

}
