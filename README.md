# playwright-projector

## [English](./README.md) | [Japanese](./README_ja.md)

playwright-projector is a simple way to use [Playwright](https://github.com/microsoft/playwright). When using Playwright, it is possible to use the Page Class operation as a projector by using a configuration and a scenario without being aware of the logic such as Browser/Context.

If you want to implement high-level web tests using Playwright's Core APIs, we recommend you use Playwright, because it's a simple way to try out Playwright.

# # Installation

Clone playright-projector to install dependent packages.

```
> git clone https://github.com/filderschoice/playwright-projector.git
> cd playwright-projector
> npm ci
```

## Getting Started.

### Let's get playwright-projector running.

playwright-projector runs with two yaml files: a config file and a scenario file.  
The config file and scenario file default to the following file names.

#### Basic file

| file-type     | file-name        | file-summary                                                                    |
| ------------- | ---------------- | ------------------------------------------------------------------------------- |
| Config file   | plConfig.yaml    | Definition file for running Playwright, playwright-projector                    |
| Scenario file | plScenarios.yaml | Definition file summarizing the actions to be performed by playwright-projector |

You will find the respective sample files in the conf folder. Copy the sample files to create the default base file.  
This is all you need to do before execution. Please refer to [see below] to prepare as necessary.

Execute playwright-projector with the following command.

```
> npm start
```

Have you confirmed that playwright-projector is working and that access to Playwright's Github and official HP is handled automatically?  
If so, you have finished checking the operation of playwright-projector.  
By the way, you can see the execution log on the prompt.  
You can also check the contents of the scenario executed by playwright-projector on the prompt.

#### Execution log of playwright-projector

```
$ npm start

> playwright-projector@0.0.1 start
> node index.js

playwright-projector start
  - config: ./conf/plConfig.yaml
  - auth: ./conf/auth/plAuth.yaml
  - scenario: ./conf/plScenarios.yaml
runPlaywright.exec begin
yyyy/mm/dd HH:MM:ss - {"type":"goto","url":"https://www.google.com/?hl=ja"}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"input","selector":"input[type=text]","value":"github playwright"}
yyyy/mm/dd HH:MM:ss - {"type":"submit","selector":"input[type=submit]"}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"conditions","subType":"click","selector":"#res a","selectorIndex":0}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"conditions","subType":"click","selector":".Layout-sidebar a.text-bold","selectorIndex":0}
yyyy/mm/dd HH:MM:ss - {"type":"pageChange","pageIndex":0,"useStack":false,"args":null}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot","pageIndex":1}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"dummy","sample":"test"}
runPlaywright.exec end
```

### Basic file structure of playwright-projector

Once you have playwright-projector running, you may be wondering about the contents of the base files.  
As mentioned above, playwright-projector consists of two yaml files, a config file and a scenario file.

#### Config file (plConfig.yaml)

```
# Playwright Options
browserType: 'chromium'
headless: false
timeout: 30000
slowMo: 10
locale: 'ja-JP'
# proxy settings
proxyInfo: []
auth: null
# page option
page:
  timeout: 30000
# save scenario screenshot
screenshot:
  dir: './result/ss'
  type: 'jpeg'
  quality: 70
# save scenario video
video:
 file: 'record-video'
```

As those of you who know Playwright will know, the contents of the config file are similar in structure to [playwright.config](https://playwright.dev/docs/test-configuration).  
It uses similar parameter values, so please check it if you are interested.  
Note that we plan to add parameters in the config file as needed in future updates.

| Parameter          | Type    | Description                                                                         | Example Setting Value                              |
| ------------------ | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- | ----- |
| browserType        | String  | browser type to operate with Playwright                                             | chromium                                           |
| headless           | Boolean | whether to start in headless browser                                                | false                                              | false |
| timeout            | Number  | Timeout value of the scenario to operate with Playwright (ms)                       | 30000                                              |
| slowMo             | Number  | Browser operation delay value (ms)                                                  | 10                                                 |
| local              | String  | browser locale                                                                      | ja-JP                                              |
| proxyInfo          | Array   | Proxy information, an array of contents set by browserArgs                          | [ '--proxy-server=proxy-url:port-number' ]         |
| auth               | Object  | auth information set by httpCredentials, separable in plAuth.yaml                   | { 'username': 'hogehoge', 'password': 'fugafuga' } |
| page.timeout       | Number  | page setDefaultTimeout set value (ms)                                               | 30000                                              |
| screenshot.dir     | String  | directory path where screenshot images are saved                                    | ./result/ss                                        |
| screenshot.type    | String  | file format for saving screenshot images                                            | jpeg                                               |
| screenshot.quality | Number  | quality of screenshot image saved                                                   | 70                                                 |
| video.file         | String  | name of file where browser-operated video is saved, directly under 'result/videos/' | 'record-video'                                     |

#### Scenario file (plScenario.yaml)

```
#######################
# Playwright Operation Scenarios
#######################
- # Scenario
  type: 'goto'
  url: 'https://www.google.com/?hl=ja'
- # Scenario
  type: 'screenshot'
- # Scenario
  type: 'wait'
  time: 1000
- # Scenario
  type: 'input'
  selector: 'input[type=text]'
  value: 'github playwright'
・・・omission
```

A scenario file in playwright-projector defines operations in a yaml-style array.  
By setting the operation parameters that come with the scenario file according to the types available in the scenario, you can easily specify the operations of Playwright.  
We plan to add more parameters in the scenario file as needed in future updates.

| Scenario Type | Operation Parameters                               | Description                                                                                                                                                                |
| ------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| goto          | arg1: url                                          | URL transition processing by page.goto([url])                                                                                                                              |
| input         | arg1: selector, arg2: value                        | bind by page.$$([selector]), input processing by page.keyboard.insertText([value])                                                                                         |
| submit        | arg1: selector                                     | bind by page.$$([selector]), execution process by selector.click()                                                                                                         |
| screenshot    | no arg                                             | screenshot processing of the displayed page                                                                                                                                |
| wait          | arg1: time(ms)                                     | wait processing for [time] time                                                                                                                                            |
| conditions    | arg1: subType, arg2: selector, arg3: selectorIndex | perform specific processing when there are multiple [selectors], [subType] is supported only for clicks                                                                    |
| pageChange    | arg1: pageIndex, arg2: useStack                    | page switching process when there are multiple pages (tabs), [useStack] is executed when Context is reused (Context reuse requires context retention)                      |
| page.operator | arg1: subeType, arg2: args, arg3: isStack          | Wrapper function for Playwright Page, [subType] specifies the API of Page, and [args] specifies the args information in the API. Retained data is determined by [isStack]. |

#### Auth file (plAuth.yaml)

```
# Playwright Auth Options
auth:
  username: 'test'
  password: 'test123'
```

In playwright-projector, Auth information in the Proxy environment can be specified in a config file, but it is possible to use an Auth file to separate the Auth information from the config file.  
The parameters are specified in the same way as in the config file.  
Use them as needed.
