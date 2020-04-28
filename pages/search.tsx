import React from 'react';
import { Row, Col, List } from 'antd';
import Router, { withRouter } from 'next/router';
import Link from 'next/link';

const { request } = require('../libs/request');

const LANGUAGES = ['JavaScript', 'HTML', 'CSS', 'React'];
const SORT_TYPES = [
  {
    name: 'Best Match',
  },
  {
    name: 'Most Stars',
    value: 'stars',
    order: 'desc',
  },
  {
    name: 'Fewest Stars',
    value: 'stars',
    order: 'asc',
  },
  {
    name: 'Most Forks',
    value: 'forks',
    order: 'desc',
  },
  {
    name: 'Fewest Forks',
    value: 'forks',
    order: 'asc',
  },
];

const selectedItemStyle = {
  borderLeft: '2px solid red',
  fontWeight: 100,
};

const Search = ({ router, repos }) => {
  console.log(repos);
  const { lang, sort, order, q } = router.query;

  const handleLanguageChange = (language) => {
    Router.push({
      pathname: '/search',
      query: {
        q,
        lang: language,
        order,
        sort,
      },
    });
  };
  const handleSortChange = (sort) => {
    Router.push({
      pathname: '/search',
      query: {
        q,
        lang,
        sort: sort.value,
        order: sort.order,
      },
    });
  };

  return (
    <div className='search-wrapper'>
      <Row gutter={20}>
        <Col span={6}>
          <List
            bordered
            header={<span className='list-header'>Language</span>}
            dataSource={LANGUAGES}
            renderItem={(item, index) => {
              const selected = lang === item;
              return (
                <List.Item
                  key={index}
                  style={selected ? selectedItemStyle : null}
                >
                  <a onClick={() => handleLanguageChange(item)}>{item}</a>
                </List.Item>
              );
            }}
          />
          <List
            bordered
            header={<span className='list-header'>Sort</span>}
            dataSource={SORT_TYPES}
            renderItem={(item, index) => {
              let selected = false;

              if (item.name === 'Best Match' && !sort) {
                selected = true;
              } else if (item.value === sort && item.order === order) {
                selected = true;
              }

              return (
                <List.Item
                  key={index}
                  style={selected ? selectedItemStyle : null}
                >
                  <a onClick={() => handleSortChange(item)}>{item.name}</a>
                </List.Item>
              );
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

Search.getInitialProps = async ({ ctx }) => {
  const { req, res } = ctx;
  const { q, sort, lang, order, page } = ctx.query;

  if (!q) {
    return {
      repos: {
        total_count: 0,
      },
    };
  }

  // ?q=react+language:javascript&sort=stars&order=desc&page=2
  let queryString = `?q=${q}`;

  if (lang) {
    queryString += `+language:${lang}`;
  }

  if (sort) {
    queryString += `&sort=${sort}&order=${order || 'desc'}`;
  }

  if (page) {
    queryString += `&page=${page}`;
  }

  const result = await request(
    {
      url: `/search/repositories${queryString}`,
    },
    req,
    res
  );

  return {
    repos: result.data,
  };
};

export default withRouter(Search);
