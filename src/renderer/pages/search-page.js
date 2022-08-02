const React = require('react')

const colors = require('material-ui/styles/colors')
const RaisedButton = require('material-ui/RaisedButton').default
const TextField = require('material-ui/TextField').default
const Heading = require('../components/heading')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')

class SearchPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleSearch =
      this.handleSearch.bind(this)

    this.renderResults =
      this.renderResults.bind(this)

    this.state = {
      term: this.props.term || "",
      results: null,
      loading: false,
    }
  }

  async handleSearch() {
    console.log("Do Search: ", this.state.term);

    const execsearch = (url) => new Promise(resolve => {
      fetch(url)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
          const results = [];
          for (const item of data.getElementsByTagName('item')) {
            const getFirst = (tagName) => {
              const tags = item.getElementsByTagName(tagName);
              if (!tags) return null;
              return tags[0];
            }

            const title = getFirst('title');
            if (!title) continue;

            const enclosure = getFirst('enclosure');
            if (!enclosure) continue;

            results.push({
              title: title.textContent,
              torrentURL: enclosure.getAttribute('url'),
            });
          }

          resolve(results);
        });
    });

    this.setState({results: null, loading: true});
    const working = [];
    const sources = this.props.state.getSearchSources();
    for (const source of sources) {
      const url = source.replace('%term%', encodeURIComponent(this.state.term));
      working.push(execsearch(url));
    }

    const results = [];
    for (const result of await Promise.all(working)) results.push(...result);
    this.setState({ results, loading: false });
  }

  loadTorrent(torrentURL) {
    console.log("Search Load Torrent: ", torrentURL);
    dispatch('addTorrent', torrentURL);
  }

  renderResults() {
    if (!Array.isArray(this.state.results) && !this.state.loading) return null;
    const innerRender = () => {
      if (this.state.loading) return <span>Loading...</span>;
      if (!this.state.results.length) return <span>No results...</span>;
      return this.state.results.map((result, idx) => {
        return (
          <div key={idx}>
            <a onClick={() => this.loadTorrent(result.torrentURL)}>{result.title}</a>
          </div>
        );
      });
    }
    return (
      <div>
        <hr/>
        <div className='search-results'>
          {innerRender()}
        </div>
      </div>
    );
  }

  render () {
    const style = {
      color: colors.grey400,
      marginLeft: 25,
      marginRight: 25
    }

    return (
      <div style={style} className='search-page'>
        <Heading level={1}>Search</Heading>
        <div className='search-header'>
          <div key='search-term' className='search-term'>
            <label>Search:</label>
            <TextField
              id="standard-basic"
              label="Standard"
              variant="standard"
              hintText='Search For Media...'
              value={this.props.term}
              onChange={(_, term) => {
                this.setState({term});
              }}
            />
            <RaisedButton
              className='control'
              onClick={this.handleSearch}
              label='Search'
            />
          </div>
        </div>
        {this.renderResults()}
      </div>
    )
  }
}

module.exports = SearchPage
