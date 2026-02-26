const GITHUB_API = 'https://api.github.com';

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  return token;
}

function getOwner(): string {
  return process.env.GITHUB_OWNER || 'markavale';
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  cloneUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
  createdAt: string;
}

export async function createRepo(
  name: string,
  description: string,
  isPrivate = true
): Promise<{ repoUrl: string; cloneUrl: string }> {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub createRepo failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    repoUrl: data.html_url as string,
    cloneUrl: data.clone_url as string,
  };
}

export async function pushFiles(
  repoName: string,
  files: Map<string, string>,
  commitMessage: string
): Promise<void> {
  const owner = getOwner();

  // Step 1: Get the latest commit SHA on the default branch
  const refRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/main`,
    { headers: headers() }
  );

  if (!refRes.ok) {
    throw new Error(`Failed to get ref: ${refRes.status} ${await refRes.text()}`);
  }

  const refData = await refRes.json();
  const latestCommitSha: string = refData.object.sha;

  // Step 2: Get the tree SHA of that commit
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/commits/${latestCommitSha}`,
    { headers: headers() }
  );

  if (!commitRes.ok) {
    throw new Error(`Failed to get commit: ${commitRes.status}`);
  }

  const commitData = await commitRes.json();
  const baseTreeSha: string = commitData.tree.sha;

  // Step 3: Create blobs for each file
  const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

  for (const [path, content] of files) {
    const blobRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repoName}/git/blobs`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ content, encoding: 'utf-8' }),
      }
    );

    if (!blobRes.ok) {
      throw new Error(`Failed to create blob for ${path}: ${blobRes.status}`);
    }

    const blobData = await blobRes.json();
    treeItems.push({
      path,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // Step 4: Create a new tree
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/trees`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    }
  );

  if (!treeRes.ok) {
    throw new Error(`Failed to create tree: ${treeRes.status}`);
  }

  const treeData = await treeRes.json();

  // Step 5: Create a new commit
  const newCommitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/commits`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    }
  );

  if (!newCommitRes.ok) {
    throw new Error(`Failed to create commit: ${newCommitRes.status}`);
  }

  const newCommitData = await newCommitRes.json();

  // Step 6: Update the ref to point to the new commit
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/refs/heads/main`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ sha: newCommitData.sha }),
    }
  );

  if (!updateRefRes.ok) {
    throw new Error(`Failed to update ref: ${updateRefRes.status}`);
  }
}

export async function getRepo(name: string): Promise<RepoInfo> {
  const owner = getOwner();

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`GitHub getRepo failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description ?? '',
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    isPrivate: data.private,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
  };
}
