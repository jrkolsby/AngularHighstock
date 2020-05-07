import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, Observable } from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

type StockData = {
  dataset: {
    data: any[]
    dataset_code: string;
    newest_available_date: string;
    oldest_available_date: string;
  }
};

@Component({
  selector: 'app-ohlc-graph',
  templateUrl: './ohlc-graph.component.html',
  styleUrls: ['./ohlc-graph.component.css']
})
export class OhlcGraphComponent implements OnInit {

  constructor(private http: HttpClient) { }

  objectkeys = Object.keys;

  public cache: Record<string, any[]> = {};
  public loading = false;
  public inputValue = '';
  public series = 1;
  public error = '';

  public options: any = {
    chart: {
      type: 'scatter',
      height: 700,
    },
    title: {
      text: 'Quandl Plotter'
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true,
      floating: true,
      verticalAlign: 'top',
      align: 'left',
      width: 100,
      height: 100,
      y: 65,
    },
    rangeSelector: {
      selected: 3,
      enabled: true,
      buttons: [
        { type: 'week', count: 1, text: '1w' },
        { type: 'month', count: 1, text: '1m' },
        { type: 'month', count: 3, text: '3m' },
        { type: 'month', count: 6, text: '6m' },
        { type: 'year', count: 1, text: '1y' },
        { type: 'ytd', text: 'YTD' },
        { type: 'all', text: 'All' }]
    },
    tooltip: {
      formatter() {
        return '<b>day: </b>' + Highcharts.dateFormat('%e %b %y %H:%M:%S', this.x) +
          ' <br> <b>price: </b>' + this.y.toFixed(2);
      }
    },
  };

  ngOnInit(): void { }

  updateInput(e): void {
    this.inputValue = e.target.value;
  }

  updateSeries(e): void {
    this.series = e.target.selectedIndex + 1;
    this.graphCache();
  }

  clearCache(): void {
    this.cache = {};
  }

  clearGraph(): void {
    this.options.series = [];
    Highcharts.stockChart('container', this.options);
  }

  graphCache(): void {
    this.options.series = Object.keys(this.cache).map(ticker => {
      return {
        type: 'scatter',
        name: ticker,
        data: this.cache[ticker].map(value => [value[0], value[this.series]]),
      };
    });
    Highcharts.stockChart('container', this.options);
  }

  fetchData(): void {

    const urls = this.inputValue.split(' ');

    this.loading = true;
    this.error = '';
    const requests = [];

    for (const url of urls) {
      requests.push(new Promise((resolve, reject) => {
        this.http.get<StockData>(url).subscribe(data => {
          resolve(data);
        }, err => {
          this.error = err.message;
          resolve(null);
        });
      }));

      Promise.all(requests).then(values => {
        for (const data of values) {
          this.inputValue = '';
          this.loading = false;

          if (!data) {
            continue;
          }

          const size = data.dataset.data.length;
          const result = Array(size).fill([0, 0, 0, 0]);

          for (let i = 0; i < size; i++) {
            const cur = data.dataset.data[size - i - 1];
            const date = new Date(cur[0]).getTime();

            result[i] = [
              date,
              cur[8],
              cur[9],
              cur[10],
              cur[11]
            ];
          }

          this.cache[data.dataset.dataset_code] = result;
        }
      });
    }
  }
}
