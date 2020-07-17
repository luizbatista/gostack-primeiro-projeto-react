import React, { useEffect, useState } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';

import logoImg from '../../assets/logo.svg';

import { Header, RepositoryInfo, Issues } from './styles';

interface RepositoryParams {
  repository: string;
}

interface Repository {
  fullName: string;
  description: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
}

interface Issue {
  id: string;
  title: string;
  htmlUrl: string;
  user: {
    login: string;
  };
}

interface ResponseIssue {
  id: string;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
}

const Repository: React.FC = () => {
  const { params } = useRouteMatch<RepositoryParams>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function loadData(): Promise<void> {
      const [responseRepository, responseIssues] = await Promise.all([
        api.get(`repos/${params.repository}`),
        api.get(`repos/${params.repository}/issues`),
      ]);

      const {
        full_name: fullName,
        description,
        owner,
        stargazers_count: stargazersCount,
        forks_count: forksCount,
        open_issues_count: openIssuesCount,
      } = responseRepository.data;

      setRepository({
        fullName,
        description,
        owner: {
          login: owner.login,
          avatarUrl: owner.avatar_url,
        },
        stargazersCount,
        forksCount,
        openIssuesCount,
      });

      setIssues([
        ...responseIssues.data.map((responseIssue: ResponseIssue) => {
          const { id, title, html_url: htmlUrl, user } = responseIssue;
          const issue = {
            id,
            title,
            htmlUrl,
            user: {
              login: user.login,
            },
          };
          return issue;
        }),
      ]);
    }

    loadData();
  }, [params.repository]);

  return (
    <>
      <Header>
        <img src={logoImg} alt="Github Explorer" />
        <Link to="/">
          <FiChevronLeft size={16} />
          Voltar
        </Link>
      </Header>

      {repository && (
        <RepositoryInfo>
          <header>
            <img
              src={repository.owner.avatarUrl}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.fullName}</strong>
              <p>{repository.description}</p>
            </div>
          </header>
          <ul>
            <li>
              <strong>{repository.stargazersCount}</strong>
              <span>Stars</span>
            </li>
            <li>
              <strong>{repository.forksCount}</strong>
              <span>Forks</span>
            </li>
            <li>
              <strong>{repository.openIssuesCount}</strong>
              <span>Issues abertas</span>
            </li>
          </ul>
        </RepositoryInfo>
      )}

      <Issues>
        {issues.map(issue => (
          <a key={issue.id} href={issue.htmlUrl}>
            <div>
              <strong>{issue.title}</strong>
              <p>{issue.user.login}</p>
            </div>
            <FiChevronRight size={20} />
          </a>
        ))}
      </Issues>
    </>
  );
};

export default Repository;
