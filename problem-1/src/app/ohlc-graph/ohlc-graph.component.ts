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

  private subscription: Subscription;

  public stocks: string[] = ['AAPL', 'IBM', 'C', 'AXP', 'CVS', 'GE', 'MSFT'];
  public selected = 0;
  public loading = false;
  public lastUpdate = new Date().toLocaleTimeString('en-US');

  public options: any = {
    chart: {
      type: 'ohlc',
      height: '700',
    },
    credits: {
      enabled: false
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
    yAxis: [{
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
        enabled: true
      }
    }, {
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Candlestick'
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2
    }],
    tooltip: {
      formatter() {
        return '<b>day: </b>' + Highcharts.dateFormat('%e %b %y %H:%M:%S', this.x) +
          ' <br> <b>price: </b>' + this.y.toFixed(2);
      }
    },
    series: [],
  };

  ngOnInit(): void {
    this.fetchStocks();
  }

  selectTicker(e: any): void {
    this.selected = e.target.selectedIndex;
    this.fetchStocks();
  }

  fetchStocks(): void {
    this.loading = true;
    this.options.series = [];

    const apiKey = 'sPPPUyY1QrCrgyzC2X-1';
    const ticker = this.stocks[this.selected];
    const url = `https://www.quandl.com/api/v3/datasets/WIKI/${ticker}.json?api_key=${apiKey}`;

    this.http.get<StockData>(url).subscribe(data => {
      const size = data.dataset.data.length;
      const result = Array(size).fill([0, 0, 0, 0]);

      let avg20 = 0;
      const movingAvg20 = Array(size).fill([0, 0]);

      let avg200 = 0;
      const movingAvg200 = Array(size).fill([0, 0]);

      for (let i = 0; i < size; i++) {
        const cur = data.dataset.data[size - i - 1];
        const avg = (cur[8] + cur[9] + cur[10] + cur[11]) / 4;

        const date = new Date(cur[0]).getTime();

        avg20 = ((19 * avg20) + avg) / 20;
        avg200 = ((199 * avg200) + avg) / 200;

        movingAvg20[i] = [date, avg20];
        movingAvg200[i] = [date, avg200];

        result[i] = [
          date,
          cur[8],
          cur[9],
          cur[10],
          cur[11]
        ];
      }

      this.options.series.push({
        type: 'line',
        name: `${ticker}-avg200`,
        data: movingAvg200,
        yAxis: 0,
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]]
          ],
        }
      });

      this.options.series.push({
        type: 'line',
        name: `${ticker}-avg20`,
        data: movingAvg20,
        yAxis: 0,
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]]
          ],
        }
      });

      this.options.series.push({
        type: 'ohlc',
        name: ticker,
        data: result,
        yAxis: 0,
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]]
          ],
        }
      });

      this.options.series.push({
        type: 'candlestick',
        name: ticker,
        data: result,
        yAxis: 1,
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]]
          ],
        }
      });

      this.options.title = ticker;
      this.loading = false;
      this.lastUpdate = new Date().toLocaleTimeString('en-US');
      Highcharts.stockChart('container', this.options);
    });
  }
}
