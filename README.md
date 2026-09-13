# playwright-projector

## [English](./README.md) | [Japanese](./README_ja.md)

playwright-projector is a simple way to use [Playwright](https://github.com/microsoft/playwright).
When using Playwright, it is possible to use the Page Class operation as a projector by using a configuration and
a scenario without being aware of the logic such as Browser/Context.

playwright-projector is intended only for trying out Playwright in a simple way.
If you want to implement high-level web tests using Playwright's Core APIs, we recommend using Playwright directly.

## Installation

Node.js 24 or later is required (the target major version is written in `.nvmrc`).

Clone playwright-projector and install the dependent packages.

```console
> git clone https://github.com/filderschoice/playwright-projector.git
> cd playwright-projector
> npm ci
> npx playwright install
```

`npx playwright install` installs the browsers operated by Playwright. Each Playwright version requires matching browsers,
so run it again after updating the dependencies.

## Getting Started

### Let's get playwright-projector running

playwright-projector runs with two yaml files: a config file and a scenario file.  
The config file and scenario file default to the following file names.

#### Basic file

| file-type     | file-name        | file-summary                                                                    |
| ------------- | ---------------- | ------------------------------------------------------------------------------- |
| Config file   | plConfig.yaml    | Definition file for running Playwright, playwright-projector                    |
| Scenario file | plScenarios.yaml | Definition file summarizing the actions to be performed by playwright-projector |

You will find the respective sample files in the conf folder. Copy the sample files to create the default base file.  
This is all you need to do before execution. The auth folder in the conf folder is needed when running
playwright-projector behind a proxy. Refer to [Auth file](#auth-file-plauthyaml) and prepare it as necessary.

Execute playwright-projector with the following command.

```console
> npm start
```

Have you confirmed that playwright-projector is working and that access to Playwright's GitHub and official HP
is handled automatically?  
If so, you have finished checking the operation of playwright-projector.  
By the way, you can see the execution log on the prompt.  
You can also check the contents of the scenario executed by playwright-projector on the prompt.

#### Execution log of playwright-projector

```text
$ npm start

> playwright-projector@0.5.0 start
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
yyyy/mm/dd HH:MM:ss - {"type":"pageChange","pageIndex":0,"useStack":false}
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

```yaml
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

As those of you who know Playwright will know, the contents of the config file are similar in structure to
[playwright.config](https://playwright.dev/docs/test-configuration).  
It uses similar parameter values, so please check it if you are interested.  
Note that we plan to add parameters in the config file as needed in future updates.

| Parameter          | Type    | Description                                                                         | Example Setting Value                              |
| ------------------ | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| browserType        | String  | browser type to operate with Playwright                                             | chromium                                           |
| headless           | Boolean | whether to start in headless browser                                                | false                                              |
| timeout            | Number  | Maximum time to wait for the browser to start (ms)                                  | 30000                                              |
| slowMo             | Number  | Browser operation delay value (ms)                                                  | 10                                                 |
| locale             | String  | browser locale                                                                      | ja-JP                                              |
| proxyInfo          | Array   | Proxy information, an array of contents set by browserArgs                          | [ '--proxy-server=proxy-url:port-number' ]         |
| auth               | Object  | auth information set by httpCredentials, separable in plAuth.yaml                   | { 'username': 'hogehoge', 'password': 'fugafuga' } |
| page.timeout       | Number  | page setDefaultTimeout set value (ms)                                               | 30000                                              |
| screenshot.dir     | String  | directory path where screenshot images are saved                                    | ./result/ss                                        |
| screenshot.type    | String  | file format for saving screenshot images                                            | jpeg                                               |
| screenshot.quality | Number  | quality of screenshot image saved                                                   | 70                                                 |
| video.file         | String  | name of file where browser-operated video is saved, directly under 'result/videos/' | 'record-video'                                     |

#### Scenario file (plScenarios.yaml)

```yaml
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
By setting the operation parameters that come with the scenario file according to the types available in the scenario,
you can easily specify the operations of Playwright.  
We plan to add more parameters in the scenario file as needed in future updates.

| Scenario Type | Operation Parameters                                                              | Description                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| goto          | arg1: url                                                                         | URL transition processing by page.goto([url])                                                                                                                              |
| input         | arg1: selector, arg2: value                                                       | bind by page.$$([selector]), input processing by page.keyboard.insertText([value])                                                                                         |
| submit        | arg1: selector                                                                    | bind by page.$$([selector]), execution process by selector.click()                                                                                                         |
| screenshot    | arg1: pageIndex(optional), arg2: options(optional)                                | screenshot processing of the displayed page, [pageIndex] saves the specified page, [options] is used instead of the screenshot settings in the config file                 |
| wait          | arg1: time(ms)                                                                    | wait processing for [time] time                                                                                                                                            |
| conditions    | arg1: subType, arg2: selector, arg3: selectorIndex, arg4: savePath(download only) | perform specific processing when there are multiple [selectors], [subType] is supported only for `click`/`download`                                                        |
| pageChange    | arg1: pageIndex, arg2: useStack                                                   | page switching process when there are multiple pages (tabs), [useStack] is executed when Context is reused (Context reuse requires context retention)                      |
| page.operator | arg1: subType, arg2: args, arg3: isStack                                          | Wrapper function for Playwright Page, [subType] specifies the API of Page, and [args] specifies the args information in the API. Retained data is determined by [isStack]. |

#### Auth file (plAuth.yaml)

```yaml
# Playwright Auth Options
auth:
  username: 'test'
  password: 'test123'
```

In playwright-projector, Auth information in the Proxy environment can be specified in a config file,
but it is possible to use an Auth file to separate the Auth information from the config file.  
The parameters are specified in the same way as in the config file.  
Use them as needed.

### Command line options

To use files other than the defaults, specify their paths with options.
When passing them to `npm start`, put them after `--`.

```console
> npm start -- -c ./conf/custom/myConfig.yaml -s ./conf/custom/myScenarios.yaml
```

| Option                  | Description                        | Default                 |
| ----------------------- | ---------------------------------- | ----------------------- |
| `-c, --config <file>`   | path of the config file            | ./conf/plConfig.yaml    |
| `-s, --scenario <file>` | path of the scenario file          | ./conf/plScenarios.yaml |
| `-a, --auth <file>`     | path of the Auth file              | ./conf/auth/plAuth.yaml |
| `-V, --version`         | print the version and exit         | -                       |
| `-h, --help`            | print the list of options and exit | -                       |

Yaml files placed directly under the `conf` folder, in `conf/auth` and in `conf/custom` are not tracked by Git,
except for the samples (`*.sample.yaml`).

### Output files

| Output                 | Location                                                           | Note                                                                   |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Screenshot             | `[screenshot.dir]/playwright-projector_[number].[screenshot.type]` | the number starts from 000 in each run and is zero-padded to 3+ digits |
| Browser-operated video | `result/videos/[video.file].webm`                                  | saved only when `video.file` is set in the config file                 |

The execution log prints each scenario as is (including `value` of input and `args` of page.operator).
Do not write secrets such as passwords in the scenario file.

### Behavior on errors

- If the scenario file is missing, empty, has a YAML syntax error or is not an array,
  or if the config file or the Auth file has a YAML syntax error or is not a mapping,
  an error is output and the process exits without launching the browser (exit code 1).
  Syntax errors show only the reason, line and column, not the file contents.
- If the config file is missing, a warning is output and default values are used.
  If the Auth file is missing, it runs as is.
- If an exception occurs while running scenarios, the page and browser are closed and the video is saved,
  then an error is output and the process exits (exit code 1).
