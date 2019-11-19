import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { ActivatedRoute, Router, NavigationEnd, UrlSegment } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { API } from '../api';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit, OnDestroy {
  apiList: API[];
  selectedAPI: string;
  currentSelection: string;
  currentAPIText: string;
  
  segments: UrlSegment[];
  routerSubscription: Subscription;

  treeControl: NestedTreeControl<API>;
  dataSource: MatTreeNestedDataSource<API>;

  screenWidth: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth$.next(event.target.innerWidth);
  }

  constructor(private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.treeControl = new NestedTreeControl<API>(node => node.children);
    this.dataSource = new MatTreeNestedDataSource<API>();

    this.route.url.subscribe((segments: UrlSegment[]) => {
      this.segments = segments;
      this.getAPIStructure();
    });

    this.screenWidth$.subscribe(width => {
      this.screenWidth = width;
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  hasChild = (_: number, node: API) => !!node.children && node.children.length > 0;

  flatten(arr) {
    var ret: API[] = [];
    for (let a of arr) {
      if (a.children) {
        ret = ret.concat(this.flatten(a.children));
      } else {
        ret = ret.concat(a);
      }
    }

    return ret;
  }

  getAPIStructure() {
    if (this.apiList) {
      this.loadSelectedAPI();
    } else {
      this.http.get('assets/api/structure.json', {responseType: 'text'}).subscribe(data => {
        this.apiList = <API[]>JSON.parse(data);
        
        this.dataSource.data = this.apiList;
        this.treeControl.dataNodes = this.apiList;
        
        this.loadSelectedAPI();
      });
    }
  }

  private loadSelectedAPI() {
    if (this.segments.length == 0) {
      this.updateAPIContent(this.apiList[0].children[0]);

      this.treeControl.expand(this.treeControl.dataNodes[0]);
    }
    else {
      var a: API[] = this.flatten(this.apiList)
        .filter(api => this.segments[this.segments.length - 1].toString() === api.displayName);

      this.updateAPIContent(a[0]);
      this.expandNodes(a[0].name);
    }
  }

  expandNodes(apiName: string) {
    var apiParts: Array<string> = apiName.split("/");
    apiParts.pop();
    if (apiParts[0] != "fe")
      apiParts = ['fe'].concat(apiParts);
    
    if (apiParts.length == 1) {
      this.treeControl.expand(this.apiList[0]);
    } else {
      var searchRange = this.apiList;
      var searchName = apiParts[0];
      for (var i: number = 0; i < apiParts.length - 1; i++) {
        searchName = searchName + "." + apiParts[i + 1];

        var expandNode = searchRange.filter(api => api.displayName === searchName)[0];
        this.treeControl.expand(expandNode);

        searchRange = expandNode.children;
      }
    }
  }

  private updateAPIContent(api: API) {
    if (!api)
      this.router.navigate(['PageNotFound']);

    window.scroll(0, 0);

    this.selectedAPI = api.name;
    this.currentSelection = 'assets/api/' + api.name;
    var path = api.name.substring(0, api.name.length - 3);
    if (!path.startsWith("fe")) {
      path = "fe/" + path;
    }
    this.getSelectedAPIText();
    
    return path;
  }

  getSelectedAPIText() {
    this.http.get(this.currentSelection, {responseType: 'text'}).subscribe(data => {
      this.currentAPIText = data;
    });
  }

  createRouterLink(url: string) {
    var components: Array<string> = url.substring(0, url.length - 3).split('/');
    if (components[0] != 'fe')
      components = ['fe'].concat(components);
    
    var ret = ['/api'];
    
    return ret.concat(components);;
  }
}
