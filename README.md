# SeqAlign.js

___A Sequence Alignment Tool___

[![Build Status](https://travis-ci.org/craigsketchley/SeqAlignJS.svg?branch=master)](https://travis-ci.org/craigsketchley/SeqAlignJS)

## Setup

### OSX

1. Install [Homebrew](http://brew.sh/) (it really should be installed, it's pretty good).

    ```
    $ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    ```
2. Install Node.js:

    ```
    $ brew install node
    ```
3. In the root project folder, install the project dependencies using:

    ```
    $ node install
    ```
4. Then "compile" (it's not really compiling) all the modules:

    ```
    $ gulp
    ```
5. You should now have a `build` directory containing `SeqAlign.js`. That's the tool. From the project root directory, you can run using the following command:

    ```
    $ node ./build/SeqAlign.js
    ```

### Linux

1. Install [Node.js](http://nodejs.org).

2. Go to step 3 of the OSX setup above.

### Windows

Three easy steps:

1. Uninstall Windows
2. Install Linux
3. See above.

## Usage

### Aligning Sequences

[Not sure how this is going to work just yet]

### Running the tests

```
jasmine-node ./spec
```
