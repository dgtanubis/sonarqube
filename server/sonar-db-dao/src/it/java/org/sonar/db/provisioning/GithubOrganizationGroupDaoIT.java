package org.sonar.db.provisioning;

import java.util.Set;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.db.DbSession;
import org.sonar.db.DbTester;
import org.sonar.db.user.GroupDao;
import org.sonar.db.user.GroupDto;

import static org.assertj.core.api.Assertions.assertThat;

public class GithubOrganizationGroupDaoIT {

  private static final String GROUP_UUID = "uuid";
  private static final String ORG_NAME = "org1";

  @Rule
  public final DbTester db = DbTester.create();

  private final DbSession dbSession = db.getSession();

  private final GroupDao groupDao = db.getDbClient().groupDao();

  private final GithubOrganizationGroupDao underTest = db.getDbClient().githubOrganizationGroupDao();

  @Test
  public void insert_savesGithubOrganizationGroup() {
    GroupDto groupDto = insertGroup(GROUP_UUID);
    GithubOrganizationGroupDto githubOrganizationGroupDto = createGithubOrganizationGroupDto(groupDto.getUuid(), ORG_NAME);

    underTest.insert(dbSession, githubOrganizationGroupDto);

    GithubOrganizationGroupDto savedGithubOrganizationGroup = underTest.selectByGroupUuid(dbSession, GROUP_UUID).orElseThrow();
    assertThat(savedGithubOrganizationGroup.organizationName()).isEqualTo(ORG_NAME);
    assertThat(savedGithubOrganizationGroup.groupUuid()).isEqualTo(GROUP_UUID);
  }

  @Test
  public void selectByGroupUuid_shouldReturnGithubOrganizationGroup() {
    GroupDto groupDto = insertGroup(GROUP_UUID);
    insertGroup("another group");
    GithubOrganizationGroupDto githubOrganizationGroupDto = createGithubOrganizationGroupDto(groupDto.getUuid(), ORG_NAME);
    underTest.insert(dbSession, githubOrganizationGroupDto);

    GithubOrganizationGroupDto savedGithubOrganizationGroup = underTest.selectByGroupUuid(dbSession, GROUP_UUID).orElseThrow();

    assertThat(savedGithubOrganizationGroup.organizationName()).isEqualTo(ORG_NAME);
    assertThat(savedGithubOrganizationGroup.groupUuid()).isEqualTo(GROUP_UUID);
    assertThat(savedGithubOrganizationGroup.getNameOrThrow()).isEqualTo(groupDto.getName());
  }

  @Test
  public void findAll_shouldReturnAllGithubOrganizationGroup() {
    insertGroup("another group");
    GroupDto groupDto = insertGroup(GROUP_UUID);
    GithubOrganizationGroupDto githubOrganizationGroupDto = createGithubOrganizationGroupDto(groupDto.getUuid(), ORG_NAME);
    underTest.insert(dbSession, githubOrganizationGroupDto);
    GroupDto groupDto2 = insertGroup(GROUP_UUID + "2");
    GithubOrganizationGroupDto githubOrganizationGroupDto2 = createGithubOrganizationGroupDto(groupDto2.getUuid(), ORG_NAME + "2");
    underTest.insert(dbSession, githubOrganizationGroupDto2);

    Set<GithubOrganizationGroupDto> all = underTest.findAll(dbSession);

    assertThat(all).hasSize(2)
      .containsExactlyInAnyOrder(
        new GithubOrganizationGroupDto(githubOrganizationGroupDto.groupUuid(), githubOrganizationGroupDto.organizationName(), groupDto.getName()),
        new GithubOrganizationGroupDto(githubOrganizationGroupDto2.groupUuid(), githubOrganizationGroupDto2.organizationName(), groupDto2.getName())
      );
  }

  @Test
  public void deleteByGroupUuid_shouldDeleteCorrectGroup() {
    GroupDto groupDto = insertGroup(GROUP_UUID);
    GithubOrganizationGroupDto githubOrganizationGroupDto = createGithubOrganizationGroupDto(groupDto.getUuid(), ORG_NAME);
    underTest.insert(dbSession, githubOrganizationGroupDto);
    GroupDto groupDto2 = insertGroup(GROUP_UUID + "2");
    GithubOrganizationGroupDto githubOrganizationGroupDto2 = createGithubOrganizationGroupDto(groupDto2.getUuid(), ORG_NAME + "2");
    underTest.insert(dbSession, githubOrganizationGroupDto2);

    underTest.deleteByGroupUuid(dbSession, githubOrganizationGroupDto.groupUuid());

    assertThat(underTest.selectByGroupUuid(dbSession, githubOrganizationGroupDto.groupUuid())).isEmpty();
    assertThat(underTest.selectByGroupUuid(dbSession, githubOrganizationGroupDto2.groupUuid())).isPresent();
  }

  private GroupDto insertGroup(String groupUuid) {
    GroupDto group = new GroupDto();
    group.setUuid(groupUuid);
    group.setName("name" + groupUuid);
    return groupDao.insert(dbSession, group);
  }

  private static GithubOrganizationGroupDto createGithubOrganizationGroupDto(String groupUuid, String organizationName) {
    return new GithubOrganizationGroupDto(groupUuid, organizationName);
  }

}
